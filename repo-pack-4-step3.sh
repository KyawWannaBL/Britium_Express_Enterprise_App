#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo ""; echo "FAILED at line $LINENO"; exit 1' ERR

backup_if_exists() {
  local f="$1"
  if [ -f "$f" ]; then
    cp "$f" "$f.bak.$(date +%Y%m%d-%H%M%S)"
  fi
}

write_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
}

FRONTEND_DIR="apps/admin-web"

mkdir -p apps/api/src/common/middleware
mkdir -p apps/api/src/common/interceptors
mkdir -p apps/api/src/modules/health
mkdir -p apps/api/src/queues/workers
mkdir -p apps/api/prisma
mkdir -p .github/workflows
mkdir -p infra
mkdir -p "$FRONTEND_DIR/src/hooks"

echo "Writing middleware and logging..."
write_file apps/api/src/common/middleware/correlation-id.middleware.ts <<'EOT'
import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    correlationId?: string;
  }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();
    req.correlationId = correlationId;
    res.setHeader("x-correlation-id", correlationId);
    next();
  }
}
EOT

write_file apps/api/src/common/interceptors/request-logging.interceptor.ts <<'EOT'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const started = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - started;
        this.logger.log(
          JSON.stringify({
            correlationId: request.correlationId ?? null,
            method: request.method,
            path: request.originalUrl,
            statusCode: response.statusCode,
            durationMs,
            userId: request.user?.sub ?? null,
          }),
        );
      }),
    );
  }
}
EOT

echo "Writing health module..."
write_file apps/api/src/modules/health/health.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
EOT

write_file apps/api/src/modules/health/health.service.ts <<'EOT'
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/integrations/redis/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async live() {
    return {
      status: "ok",
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    const redis = await this.redisService.getClient();
    await redis.ping();

    return {
      status: "ready",
      database: "ok",
      redis: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
EOT

write_file apps/api/src/modules/health/health.controller.ts <<'EOT'
import { Controller, Get } from "@nestjs/common";
import { okResponse } from "src/common/dto/api-response.dto";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("live")
  async live() {
    return okResponse(await this.healthService.live(), "Liveness OK");
  }

  @Get("ready")
  async ready() {
    return okResponse(await this.healthService.ready(), "Readiness OK");
  }
}
EOT

echo "Writing queues..."
write_file apps/api/src/queues/queues.module.ts <<'EOT'
import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { LabelJobsProcessor } from "./workers/label-jobs.processor";
import { NotificationsJobsProcessor } from "./workers/notifications-jobs.processor";
import { QueuePublisherService } from "./queue-publisher.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>("REDIS_URL");
        const url = new URL(redisUrl);

        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            password: url.password || undefined,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: "labels" },
      { name: "notifications" },
      { name: "imports" },
    ),
  ],
  providers: [
    QueuePublisherService,
    LabelJobsProcessor,
    NotificationsJobsProcessor,
  ],
  exports: [QueuePublisherService, BullModule],
})
export class QueuesModule {}
EOT

write_file apps/api/src/queues/queue-publisher.service.ts <<'EOT'
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class QueuePublisherService {
  constructor(
    @InjectQueue("labels") private readonly labelsQueue: Queue,
    @InjectQueue("notifications") private readonly notificationsQueue: Queue,
    @InjectQueue("imports") private readonly importsQueue: Queue,
  ) {}

  enqueueLabelGeneration(payload: unknown) {
    return this.labelsQueue.add("generate-label", payload);
  }

  enqueueNotification(payload: unknown) {
    return this.notificationsQueue.add("send-notification", payload);
  }

  enqueueImportProcessing(payload: unknown) {
    return this.importsQueue.add("process-import", payload);
  }
}
EOT

write_file apps/api/src/queues/workers/label-jobs.processor.ts <<'EOT'
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("labels")
export class LabelJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(LabelJobsProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing label job ${job.id}`);
    return {
      ok: true,
      type: job.name,
      payload: job.data,
    };
  }
}
EOT

write_file apps/api/src/queues/workers/notifications-jobs.processor.ts <<'EOT'
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("notifications")
export class NotificationsJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsJobsProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing notification job ${job.id}`);
    return {
      ok: true,
      type: job.name,
      payload: job.data,
    };
  }
}
EOT

echo "Writing seed..."
backup_if_exists apps/api/prisma/seed.ts
write_file apps/api/prisma/seed.ts <<'EOT'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roleCodes = [
    ["rider", "Rider"],
    ["driver", "Driver"],
    ["warehouse_manager", "Warehouse Manager"],
    ["receiving_clerk", "Receiving Clerk"],
    ["sorting_staff", "Sorting Staff"],
    ["inventory_controller", "Inventory Controller"],
    ["dispatch_coordinator", "Dispatch Coordinator"],
    ["qa_officer", "QA Officer"],
    ["returns_officer", "Returns Officer"],
    ["scanner_operator", "Scanner Operator"],
    ["data_entry_clerk", "Data Entry Clerk"],
    ["senior_data_entry_reviewer", "Senior Data Entry Reviewer"],
    ["data_entry_supervisor", "Data Entry Supervisor"],
    ["operations_supervisor", "Operations Supervisor"],
    ["dispatch_supervisor", "Dispatch Supervisor"],
    ["fleet_supervisor", "Fleet Supervisor"],
    ["planning_supervisor", "Planning Supervisor"],
    ["branch_supervisor", "Branch Supervisor"],
    ["senior_operations_manager", "Senior Operations Manager"],
    ["hr_officer", "HR Officer"],
    ["hr_manager", "HR Manager"],
    ["admin_manager", "Admin Manager"],
    ["people_ops_lead", "People Ops Lead"],
    ["super_admin", "Super Admin"],
  ];

  for (const [code, name] of roleCodes) {
    await prisma.role.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const ygn = await prisma.branch.upsert({
    where: { code: "YGN-HQ" },
    update: {},
    create: {
      code: "YGN-HQ",
      name: "Yangon Headquarters",
      city: "Yangon",
      region: "Yangon",
    },
  });

  const mdy = await prisma.branch.upsert({
    where: { code: "MDY-HUB" },
    update: {},
    create: {
      code: "MDY-HUB",
      name: "Mandalay Hub",
      city: "Mandalay",
      region: "Mandalay",
    },
  });

  await prisma.warehouseLocation.upsert({
    where: { code: "BIN-A12" },
    update: {},
    create: {
      code: "BIN-A12",
      locationType: "INBOUND_BIN",
      branchId: ygn.id,
      capacity: 100,
      currentLoad: 12,
    },
  });

  await prisma.warehouseLocation.upsert({
    where: { code: "STAGE-R1" },
    update: {},
    create: {
      code: "STAGE-R1",
      locationType: "STAGING_LANE",
      branchId: ygn.id,
      capacity: 50,
      currentLoad: 8,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "superadmin@britium.local" },
    update: {},
    create: {
      email: "superadmin@britium.local",
      fullName: "System Super Admin",
      active: true,
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: "hr.manager@britium.local" },
    update: {},
    create: {
      email: "hr.manager@britium.local",
      fullName: "HR Manager",
      active: true,
    },
  });

  const opsUser = await prisma.user.upsert({
    where: { email: "ops.supervisor@britium.local" },
    update: {},
    create: {
      email: "ops.supervisor@britium.local",
      fullName: "Operations Supervisor",
      active: true,
    },
  });

  const riderUser = await prisma.user.upsert({
    where: { email: "rider.01@britium.local" },
    update: {},
    create: {
      email: "rider.01@britium.local",
      fullName: "Rider One",
      active: true,
    },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { code: "super_admin" } });
  const hrRole = await prisma.role.findUniqueOrThrow({ where: { code: "hr_manager" } });
  const opsRole = await prisma.role.findUniqueOrThrow({ where: { code: "operations_supervisor" } });
  const riderRole = await prisma.role.findUniqueOrThrow({ where: { code: "rider" } });

  const bindings = [
    [adminUser.id, superAdminRole.id, ygn.id],
    [hrUser.id, hrRole.id, ygn.id],
    [opsUser.id, opsRole.id, ygn.id],
    [riderUser.id, riderRole.id, ygn.id],
  ];

  for (const [userId, roleId, branchId] of bindings) {
    const existing = await prisma.roleBinding.findFirst({
      where: { userId, roleId, branchId },
    });

    if (!existing) {
      await prisma.roleBinding.create({
        data: { userId, roleId, branchId },
      });
    }
  }

  const employeeRecords = [
    [adminUser, "EMP-0001", "Administration", "System Administrator"],
    [hrUser, "EMP-0002", "People", "HR Manager"],
    [opsUser, "EMP-0003", "Operations", "Operations Supervisor"],
    [riderUser, "EMP-0004", "Operations", "Delivery Rider"],
  ] as const;

  for (const [user, employeeCode, department, title] of employeeRecords) {
    await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeCode,
        department,
        title,
        branchId: ygn.id,
        joinDate: new Date("2025-01-01T00:00:00.000Z"),
        employmentStatus: "ACTIVE",
      },
    });
  }

  const manifest = await prisma.manifest.upsert({
    where: { manifestNo: "MNF-240401-01" },
    update: {},
    create: {
      manifestNo: "MNF-240401-01",
      destinationBranchId: mdy.id,
      bagCode: "BG-1001",
      sealCode: "SEAL-1001",
      status: "CREATED",
    },
  });

  const shipment1 = await prisma.shipment.upsert({
    where: { awb: "BEX-240401001" },
    update: {},
    create: {
      awb: "BEX-240401001",
      senderName: "Britium Ventures",
      senderPhone: "0911111111",
      receiverName: "Daw Ei Ei",
      receiverPhone: "0999990001",
      receiverAddress: "Sanchaung Township",
      township: "Sanchaung",
      city: "Yangon",
      zoneCode: "YGN-CENTRAL",
      codAmount: 35000,
      serviceType: "same_day",
      status: "ASSIGNED",
      branchId: ygn.id,
      manifestId: manifest.id,
    },
  });

  const shipment2 = await prisma.shipment.upsert({
    where: { awb: "BEX-240401002" },
    update: {},
    create: {
      awb: "BEX-240401002",
      senderName: "City Fresh",
      senderPhone: "0922222222",
      receiverName: "Ko Thant Zin",
      receiverPhone: "0999990002",
      receiverAddress: "Chanmyathazi Township",
      township: "Chanmyathazi",
      city: "Mandalay",
      zoneCode: "MDY-CENTRAL",
      codAmount: 0,
      serviceType: "next_day",
      status: "IN_TRANSIT",
      branchId: ygn.id,
      manifestId: manifest.id,
    },
  });

  const shipment3 = await prisma.shipment.upsert({
    where: { awb: "BEX-240401003" },
    update: {},
    create: {
      awb: "BEX-240401003",
      senderName: "Golden Shop",
      senderPhone: "0933333333",
      receiverName: "Ko Yadanar Htun",
      receiverPhone: "0999990003",
      receiverAddress: "North Okkalapa Township",
      township: "North Okkalapa",
      city: "Yangon",
      zoneCode: "YGN-NORTH",
      codAmount: 18000,
      serviceType: "standard",
      status: "FAILED",
      branchId: ygn.id,
    },
  });

  await prisma.manifest.update({
    where: { id: manifest.id },
    data: {
      totalShipments: 2,
      totalCod: 35000,
    },
  });

  const tasks = [
    [shipment1.id, "rider-driver", "DELIVERY", "ASSIGNED", riderUser.id],
    [shipment2.id, "warehouse", "TRANSFER_MONITOR", "ASSIGNED", opsUser.id],
    [shipment3.id, "supervisor", "FAILED_DELIVERY_REVIEW", "UNDER_REVIEW", opsUser.id],
  ] as const;

  for (const [shipmentId, portal, taskType, status, assignedToId] of tasks) {
    const existing = await prisma.task.findFirst({
      where: { shipmentId, portal, taskType, assignedToId },
    });

    if (!existing) {
      await prisma.task.create({
        data: {
          shipmentId,
          portal,
          taskType,
          status,
          assignedToId,
          createdById: adminUser.id,
          branchId: ygn.id,
          payload: {},
        },
      });
    }
  }

  await prisma.transfer.upsert({
    where: { transferNo: "TR-240401-01" },
    update: {},
    create: {
      transferNo: "TR-240401-01",
      fromBranchId: ygn.id,
      toBranchId: mdy.id,
      shipmentCount: 2,
      totalCod: 35000,
      status: "DISPATCHED",
      departureAt: new Date(),
    },
  });

  await prisma.dataEntryRecord.upsert({
    where: { referenceNo: "DER-240401-01" },
    update: {},
    create: {
      referenceNo: "DER-240401-01",
      recordType: "NRC_CAPTURE",
      branchId: ygn.id,
      status: "SUBMITTED",
      createdByUserId: adminUser.id,
      reviewerUserId: hrUser.id,
      payload: {
        applicantName: "Aung Aung",
        source: "manual-entry",
      },
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOT

echo "Patching package.json..."
backup_if_exists apps/api/package.json
node <<'EOT'
const fs = require("fs");
const path = "apps/api/package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
pkg.prisma = { ...(pkg.prisma || {}), seed: "tsx prisma/seed.ts" };
pkg.scripts = { ...(pkg.scripts || {}), "db:seed": "prisma db seed" };
fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log("Updated", path);
EOT

echo "Writing app.module.ts and main.ts..."
backup_if_exists apps/api/src/app.module.ts
write_file apps/api/src/app.module.ts <<'EOT'
import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./integrations/redis/redis.module";
import { S3Module } from "./integrations/s3/s3.module";
import { AuditLogInterceptor } from "./common/interceptors/audit-log.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { BranchesModule } from "./modules/branches/branches.module";
import { ShipmentsModule } from "./modules/shipments/shipments.module";
import { AttachmentsModule } from "./modules/attachments/attachments.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { DeliveriesModule } from "./modules/deliveries/deliveries.module";
import { WarehousesModule } from "./modules/warehouses/warehouses.module";
import { DataEntryModule } from "./modules/data-entry/data-entry.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { LeaveRequestsModule } from "./modules/leave-requests/leave-requests.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { SupervisorModule } from "./modules/supervisor/supervisor.module";
import { ManifestsModule } from "./modules/manifests/manifests.module";
import { TransfersModule } from "./modules/transfers/transfers.module";
import { QrModule } from "./modules/qr/qr.module";
import { LabelsModule } from "./modules/labels/labels.module";
import { TamperTagsModule } from "./modules/tamper-tags/tamper-tags.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { HealthModule } from "./modules/health/health.module";
import { QueuesModule } from "./queues/queues.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    RedisModule,
    S3Module,
    QueuesModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    BranchesModule,
    ShipmentsModule,
    AttachmentsModule,
    NotificationsModule,
    TasksModule,
    DeliveriesModule,
    WarehousesModule,
    DataEntryModule,
    EmployeesModule,
    AttendanceModule,
    LeaveRequestsModule,
    UploadsModule,
    SupervisorModule,
    ManifestsModule,
    TransfersModule,
    QrModule,
    LabelsModule,
    TamperTagsModule,
    DevicesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
EOT

backup_if_exists apps/api/src/main.ts
write_file apps/api/src/main.ts <<'EOT'
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: true,
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);

  Logger.log(`API listening on http://localhost:${port}/api`, "Bootstrap");
}

bootstrap();
EOT

echo "Writing Docker and CI..."
backup_if_exists apps/api/Dockerfile
write_file apps/api/Dockerfile <<'EOT'
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
EXPOSE 4000
CMD ["node", "dist/main.js"]
EOT

backup_if_exists "$FRONTEND_DIR/Dockerfile"
write_file "$FRONTEND_DIR/Dockerfile" <<'EOT'
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
EOT

write_file infra/docker-compose.prod.yml <<'EOT'
version: "3.9"

services:
  postgres:
    image: postgres:18
    restart: unless-stopped
    environment:
      POSTGRES_DB: logistics_ops
      POSTGRES_USER: logistics
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data

  api:
    build:
      context: ../apps/api
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file:
      - ../.env
    depends_on:
      - postgres
      - redis
      - minio
    ports:
      - "4000:4000"

  admin_web:
    build:
      context: ../apps/admin-web
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file:
      - ../.env
    depends_on:
      - api
    ports:
      - "3000:3000"

volumes:
  pg_data:
  redis_data:
  minio_data:
EOT

write_file .github/workflows/ci.yml <<'EOT'
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  api:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: apps/api/package-lock.json
      - run: npm ci
      - run: npx prisma generate
      - run: npm run build

  admin-web:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/admin-web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: apps/admin-web/package-lock.json
      - run: npm ci
      - run: npm run build
EOT

echo "Writing remaining frontend hooks..."
write_file "$FRONTEND_DIR/src/hooks/use-auth-me.ts" <<'EOT'
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await api.get("/api/auth/me");
      return response.data;
    },
  });
}
EOT

write_file "$FRONTEND_DIR/src/hooks/use-rider-tasks.ts" <<'EOT'
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useRiderTasks() {
  return useQuery({
    queryKey: ["tasks", "me"],
    queryFn: async () => {
      const response = await api.get("/api/tasks/me");
      return response.data;
    },
  });
}
EOT

write_file "$FRONTEND_DIR/src/hooks/use-warehouse-exception-queue.ts" <<'EOT'
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useWarehouseExceptionQueue(branchId?: string) {
  return useQuery({
    queryKey: ["warehouses", "exception-queue", branchId],
    queryFn: async () => {
      const response = await api.get("/api/warehouses/exception-queue", {
        params: { branchId },
      });
      return response.data;
    },
    enabled: true,
  });
}
EOT

write_file "$FRONTEND_DIR/src/hooks/use-employee-list.ts" <<'EOT'
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useEmployeeList() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/api/employees");
      return response.data;
    },
  });
}
EOT

echo "Step 3 completed successfully."
