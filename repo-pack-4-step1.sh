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

echo "Using admin frontend paths..."
FRONTEND_DIR="apps/admin-web"

mkdir -p apps/api/src/integrations/s3
mkdir -p apps/api/src/modules/uploads/dto
mkdir -p apps/api/src/modules/uploads
mkdir -p apps/api/src/modules/supervisor
mkdir -p "$FRONTEND_DIR/src/hooks"

echo "Writing S3 integration..."
write_file apps/api/src/integrations/s3/s3.module.ts <<'EOT'
import { Global, Module } from "@nestjs/common";
import { S3Service } from "./s3.service";

@Global()
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
EOT

write_file apps/api/src/integrations/s3/s3.service.ts <<'EOT'
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.getOrThrow<string>("S3_ENDPOINT");
    const region = this.configService.getOrThrow<string>("S3_REGION");
    const accessKeyId = this.configService.getOrThrow<string>("S3_ACCESS_KEY");
    const secretAccessKey = this.configService.getOrThrow<string>("S3_SECRET_KEY");

    this.bucket = this.configService.getOrThrow<string>("S3_BUCKET");

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  getBucket() {
    return this.bucket;
  }

  async createSignedUploadUrl(params: {
    objectKey: string;
    contentType: string;
    expiresIn?: number;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.objectKey,
      ContentType: params.contentType,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn ?? 300,
    });

    return {
      bucket: this.bucket,
      objectKey: params.objectKey,
      url,
      expiresIn: params.expiresIn ?? 300,
    };
  }

  async createSignedDownloadUrl(params: {
    objectKey: string;
    expiresIn?: number;
  }) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: params.objectKey,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: params.expiresIn ?? 300,
    });

    return {
      bucket: this.bucket,
      objectKey: params.objectKey,
      url,
      expiresIn: params.expiresIn ?? 300,
    };
  }
}
EOT

echo "Writing uploads module..."
write_file apps/api/src/modules/uploads/dto/create-signed-upload.dto.ts <<'EOT'
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSignedUploadDto {
  @IsIn(["IMAGE", "PDF", "DOCUMENT", "SIGNATURE", "LABEL", "QR"])
  kind!: "IMAGE" | "PDF" | "DOCUMENT" | "SIGNATURE" | "LABEL" | "QR";

  @IsString()
  @MaxLength(120)
  mimeType!: string;

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  dataEntryRecordId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
EOT

write_file apps/api/src/modules/uploads/uploads.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
EOT

write_file apps/api/src/modules/uploads/uploads.service.ts <<'EOT'
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { S3Service } from "src/integrations/s3/s3.service";

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createSignedUpload(params: {
    kind: "IMAGE" | "PDF" | "DOCUMENT" | "SIGNATURE" | "LABEL" | "QR";
    mimeType: string;
    fileName: string;
    uploadedById?: string;
    shipmentId?: string;
    dataEntryRecordId?: string;
    comment?: string;
  }) {
    const safeFileName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `${params.kind.toLowerCase()}/${Date.now()}-${safeFileName}`;

    const signed = await this.s3Service.createSignedUploadUrl({
      objectKey,
      contentType: params.mimeType,
    });

    const attachment = await this.prisma.attachment.create({
      data: {
        kind: params.kind,
        bucket: signed.bucket,
        objectKey: signed.objectKey,
        mimeType: params.mimeType,
        fileName: params.fileName,
        uploadedById: params.uploadedById,
        shipmentId: params.shipmentId,
        dataEntryRecordId: params.dataEntryRecordId,
        comment: params.comment,
      },
    });

    return {
      attachment,
      upload: signed,
    };
  }

  async createSignedDownload(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    const download = await this.s3Service.createSignedDownloadUrl({
      objectKey: attachment.objectKey,
    });

    return {
      attachment,
      download,
    };
  }
}
EOT

write_file apps/api/src/modules/uploads/uploads.controller.ts <<'EOT'
import { Controller, Get, Param, Post, UseGuards, Body } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";
import { okResponse } from "src/common/dto/api-response.dto";
import { UploadsService } from "./uploads.service";
import { CreateSignedUploadDto } from "./dto/create-signed-upload.dto";

@Controller("uploads")
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("signed-upload")
  async signedUpload(
    @Body() body: CreateSignedUploadDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.uploadsService.createSignedUpload({
      ...body,
      uploadedById: user.sub,
    });

    return okResponse(result, "Signed upload URL created");
  }

  @Get("signed-download/:attachmentId")
  async signedDownload(@Param("attachmentId") attachmentId: string) {
    const result = await this.uploadsService.createSignedDownload(attachmentId);
    return okResponse(result, "Signed download URL created");
  }
}
EOT

echo "Writing supervisor module..."
write_file apps/api/src/modules/supervisor/supervisor.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { SupervisorController } from "./supervisor.controller";
import { SupervisorService } from "./supervisor.service";

@Module({
  controllers: [SupervisorController],
  providers: [SupervisorService],
  exports: [SupervisorService],
})
export class SupervisorModule {}
EOT

write_file apps/api/src/modules/supervisor/supervisor.service.ts <<'EOT'
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SupervisorService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(branchId?: string) {
    const shipmentWhere = branchId ? { branchId } : {};
    const taskWhere = branchId ? { branchId } : {};

    const [
      totalShipments,
      assignedShipments,
      inTransitShipments,
      failedShipments,
      deliveredShipments,
      openTasks,
      exceptionEvents,
    ] = await Promise.all([
      this.prisma.shipment.count({ where: shipmentWhere }),
      this.prisma.shipment.count({ where: { ...shipmentWhere, status: "ASSIGNED" } }),
      this.prisma.shipment.count({ where: { ...shipmentWhere, status: "IN_TRANSIT" } }),
      this.prisma.shipment.count({ where: { ...shipmentWhere, status: "FAILED" } }),
      this.prisma.shipment.count({ where: { ...shipmentWhere, status: "DELIVERED" } }),
      this.prisma.task.count({ where: { ...taskWhere, status: "ASSIGNED" } }),
      this.prisma.warehouseEvent.count({
        where: {
          shipment: shipmentWhere,
          eventType: {
            in: ["QC_HOLD", "DAMAGE_FLAGGED", "LABEL_MISMATCH", "MISSING_PIECE"],
          },
        },
      }),
    ]);

    return {
      branchId: branchId ?? null,
      totalShipments,
      assignedShipments,
      inTransitShipments,
      failedShipments,
      deliveredShipments,
      openTasks,
      exceptionEvents,
    };
  }

  async getOperationalQueue(branchId?: string) {
    return this.prisma.task.findMany({
      where: {
        branchId: branchId ?? undefined,
      },
      orderBy: { createdAt: "desc" },
      include: {
        shipment: true,
        assignedTo: true,
      },
      take: 100,
    });
  }
}
EOT

write_file apps/api/src/modules/supervisor/supervisor.controller.ts <<'EOT'
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { SupervisorService } from "./supervisor.service";

@Controller("supervisor")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get("dashboard")
  @Roles(
    "operations_supervisor",
    "dispatch_supervisor",
    "fleet_supervisor",
    "planning_supervisor",
    "branch_supervisor",
    "senior_operations_manager",
    "super_admin",
  )
  async dashboard(@Query("branchId") branchId?: string) {
    const data = await this.supervisorService.getDashboard(branchId);
    return okResponse(data, "Supervisor dashboard loaded");
  }

  @Get("queue")
  @Roles(
    "operations_supervisor",
    "dispatch_supervisor",
    "fleet_supervisor",
    "planning_supervisor",
    "branch_supervisor",
    "senior_operations_manager",
    "super_admin",
  )
  async queue(@Query("branchId") branchId?: string) {
    const data = await this.supervisorService.getOperationalQueue(branchId);
    return okResponse(data, "Operational queue loaded", { total: data.length, branchId });
  }
}
EOT

echo "Writing frontend hooks..."
write_file "$FRONTEND_DIR/src/hooks/use-supervisor-dashboard.ts" <<'EOT'
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSupervisorDashboard(branchId?: string) {
  return useQuery({
    queryKey: ["supervisor", "dashboard", branchId],
    queryFn: async () => {
      const response = await api.get("/api/supervisor/dashboard", {
        params: { branchId },
      });
      return response.data;
    },
  });
}
EOT

write_file "$FRONTEND_DIR/src/hooks/use-signed-upload.ts" <<'EOT'
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSignedUpload() {
  return useMutation({
    mutationFn: async (payload: {
      kind: "IMAGE" | "PDF" | "DOCUMENT" | "SIGNATURE" | "LABEL" | "QR";
      mimeType: string;
      fileName: string;
      shipmentId?: string;
      dataEntryRecordId?: string;
      comment?: string;
    }) => {
      const response = await api.post("/api/uploads/signed-upload", payload);
      return response.data;
    },
  });
}
EOT

echo "Step 1 completed successfully."
