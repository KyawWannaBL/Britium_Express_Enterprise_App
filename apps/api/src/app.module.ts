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
