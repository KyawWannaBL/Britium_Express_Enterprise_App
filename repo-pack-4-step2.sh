#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo ""; echo "FAILED at line $LINENO"; exit 1' ERR

write_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
}

echo "Creating module folders..."
mkdir -p apps/api/src/modules/manifests
mkdir -p apps/api/src/modules/transfers
mkdir -p apps/api/src/modules/qr
mkdir -p apps/api/src/modules/labels
mkdir -p apps/api/src/modules/tamper-tags
mkdir -p apps/api/src/modules/devices

echo "Writing manifests..."
write_file apps/api/src/modules/manifests/manifests.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { ManifestsController } from "./manifests.controller";
import { ManifestsService } from "./manifests.service";

@Module({
  controllers: [ManifestsController],
  providers: [ManifestsService],
  exports: [ManifestsService],
})
export class ManifestsModule {}
EOT

write_file apps/api/src/modules/manifests/manifests.service.ts <<'EOT'
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ManifestsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.manifest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        shipments: true,
        destinationBranch: true,
        vehicle: true,
      },
    });
  }

  async create(params: {
    manifestNo: string;
    destinationBranchId?: string;
    bagCode?: string;
    sealCode?: string;
    vehicleId?: string;
  }) {
    return this.prisma.manifest.create({
      data: {
        manifestNo: params.manifestNo,
        destinationBranchId: params.destinationBranchId,
        bagCode: params.bagCode,
        sealCode: params.sealCode,
        vehicleId: params.vehicleId,
        status: "CREATED",
      },
    });
  }

  async attachShipment(manifestId: string, awb: string) {
    const manifest = await this.prisma.manifest.findUnique({ where: { id: manifestId } });
    if (!manifest) {
      throw new NotFoundException("Manifest not found");
    }

    const shipment = await this.prisma.shipment.findUnique({ where: { awb } });
    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }

    await this.prisma.shipment.update({
      where: { id: shipment.id },
      data: { manifestId: manifest.id },
    });

    const shipments = await this.prisma.shipment.findMany({ where: { manifestId: manifest.id } });
    const totalCod = shipments.reduce((sum, row) => sum + Number(row.codAmount), 0);

    return this.prisma.manifest.update({
      where: { id: manifest.id },
      data: {
        totalShipments: shipments.length,
        totalCod,
      },
      include: {
        shipments: true,
      },
    });
  }
}
EOT

write_file apps/api/src/modules/manifests/manifests.controller.ts <<'EOT'
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { ManifestsService } from "./manifests.service";

@Controller("manifests")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManifestsController {
  constructor(private readonly manifestsService: ManifestsService) {}

  @Get()
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async list() {
    const manifests = await this.manifestsService.list();
    return okResponse(manifests, "Manifests loaded", { total: manifests.length });
  }

  @Post()
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async create(
    @Body()
    body: {
      manifestNo: string;
      destinationBranchId?: string;
      bagCode?: string;
      sealCode?: string;
      vehicleId?: string;
    },
  ) {
    const manifest = await this.manifestsService.create(body);
    return okResponse(manifest, "Manifest created");
  }

  @Patch(":manifestId/attach-shipment")
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async attachShipment(
    @Param("manifestId") manifestId: string,
    @Body() body: { awb: string },
  ) {
    const manifest = await this.manifestsService.attachShipment(manifestId, body.awb);
    return okResponse(manifest, "Shipment attached to manifest");
  }
}
EOT

echo "Writing transfers..."
write_file apps/api/src/modules/transfers/transfers.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { TransfersController } from "./transfers.controller";
import { TransfersService } from "./transfers.service";

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
EOT

write_file apps/api/src/modules/transfers/transfers.service.ts <<'EOT'
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.transfer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fromBranch: true,
        toBranch: true,
      },
    });
  }

  create(params: {
    transferNo: string;
    fromBranchId?: string;
    toBranchId?: string;
  }) {
    return this.prisma.transfer.create({
      data: {
        transferNo: params.transferNo,
        fromBranchId: params.fromBranchId,
        toBranchId: params.toBranchId,
        status: "CREATED",
      },
    });
  }

  async dispatch(id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) {
      throw new NotFoundException("Transfer not found");
    }

    return this.prisma.transfer.update({
      where: { id },
      data: {
        status: "DISPATCHED",
        departureAt: new Date(),
      },
    });
  }

  async receive(id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) {
      throw new NotFoundException("Transfer not found");
    }

    return this.prisma.transfer.update({
      where: { id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
    });
  }
}
EOT

write_file apps/api/src/modules/transfers/transfers.controller.ts <<'EOT'
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { TransfersService } from "./transfers.service";

@Controller("transfers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async list() {
    const transfers = await this.transfersService.list();
    return okResponse(transfers, "Transfers loaded", { total: transfers.length });
  }

  @Post()
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async create(
    @Body() body: { transferNo: string; fromBranchId?: string; toBranchId?: string },
  ) {
    const transfer = await this.transfersService.create(body);
    return okResponse(transfer, "Transfer created");
  }

  @Patch(":id/dispatch")
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async dispatch(@Param("id") id: string) {
    const transfer = await this.transfersService.dispatch(id);
    return okResponse(transfer, "Transfer dispatched");
  }

  @Patch(":id/receive")
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async receive(@Param("id") id: string) {
    const transfer = await this.transfersService.receive(id);
    return okResponse(transfer, "Transfer received");
  }
}
EOT

echo "Writing qr..."
write_file apps/api/src/modules/qr/qr.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { QrController } from "./qr.controller";
import { QrService } from "./qr.service";

@Module({
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
EOT

write_file apps/api/src/modules/qr/qr.service.ts <<'EOT'
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class QrService {
  constructor(private readonly prisma: PrismaService) {}

  async createShipmentQr(awb: string) {
    const payload = JSON.stringify({ type: "SHIPMENT", awb });

    return this.prisma.qRCode.create({
      data: {
        qrType: "SHIPMENT",
        referenceType: "SHIPMENT",
        referenceId: awb,
        payload,
        activated: true,
      },
    });
  }

  list() {
    return this.prisma.qRCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
EOT

write_file apps/api/src/modules/qr/qr.controller.ts <<'EOT'
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { QrService } from "./qr.service";

@Controller("qr")
@UseGuards(JwtAuthGuard, RolesGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get()
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async list() {
    const codes = await this.qrService.list();
    return okResponse(codes, "QR codes loaded", { total: codes.length });
  }

  @Post("shipment")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async createShipmentQr(@Body() body: { awb: string }) {
    const qr = await this.qrService.createShipmentQr(body.awb);
    return okResponse(qr, "Shipment QR created");
  }
}
EOT

echo "Writing labels..."
write_file apps/api/src/modules/labels/labels.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { LabelsController } from "./labels.controller";
import { LabelsService } from "./labels.service";

@Module({
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}
EOT

write_file apps/api/src/modules/labels/labels.service.ts <<'EOT'
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async shipmentLabel(awb: string) {
    const shipment = await this.prisma.shipment.findUnique({ where: { awb } });
    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }

    return {
      awb: shipment.awb,
      receiverName: shipment.receiverName,
      receiverPhone: shipment.receiverPhone,
      receiverAddress: shipment.receiverAddress,
      township: shipment.township,
      city: shipment.city,
      zoneCode: shipment.zoneCode,
      serviceType: shipment.serviceType,
      codAmount: shipment.codAmount,
      barcodeValue: shipment.awb,
      qrPayload: JSON.stringify({ type: "SHIPMENT", awb: shipment.awb }),
      printedAt: new Date().toISOString(),
    };
  }
}
EOT

write_file apps/api/src/modules/labels/labels.controller.ts <<'EOT'
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { LabelsService } from "./labels.service";

@Controller("labels")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get("shipment")
  @Roles("warehouse_manager", "dispatch_supervisor", "scanner_operator", "super_admin")
  async shipmentLabel(@Query("awb") awb: string) {
    const label = await this.labelsService.shipmentLabel(awb);
    return okResponse(label, "Shipment label generated");
  }
}
EOT

echo "Writing tamper-tags..."
write_file apps/api/src/modules/tamper-tags/tamper-tags.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { TamperTagsController } from "./tamper-tags.controller";
import { TamperTagsService } from "./tamper-tags.service";

@Module({
  controllers: [TamperTagsController],
  providers: [TamperTagsService],
  exports: [TamperTagsService],
})
export class TamperTagsModule {}
EOT

write_file apps/api/src/modules/tamper-tags/tamper-tags.service.ts <<'EOT'
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TamperTagsService {
  constructor(private readonly prisma: PrismaService) {}

  listBatches() {
    return this.prisma.tamperTagBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: { tags: true },
    });
  }

  createBatch(params: { batchCode: string; totalIssued: number; issuedToUserId?: string }) {
    return this.prisma.tamperTagBatch.create({
      data: {
        batchCode: params.batchCode,
        issuedToUserId: params.issuedToUserId,
        totalIssued: params.totalIssued,
        totalRemaining: params.totalIssued,
      },
    });
  }

  async registerTag(params: { batchId: string; tagCode: string }) {
    return this.prisma.tamperTag.create({
      data: {
        batchId: params.batchId,
        tagCode: params.tagCode,
        status: "ISSUED",
      },
    });
  }

  async useTag(tagCode: string, shipmentId: string) {
    const tag = await this.prisma.tamperTag.findUnique({ where: { tagCode } });
    if (!tag) {
      throw new NotFoundException("Tamper tag not found");
    }

    const updated = await this.prisma.tamperTag.update({
      where: { tagCode },
      data: {
        status: "USED",
        usedOnShipmentId: shipmentId,
      },
    });

    const batch = await this.prisma.tamperTagBatch.findUnique({ where: { id: tag.batchId } });
    if (batch) {
      await this.prisma.tamperTagBatch.update({
        where: { id: batch.id },
        data: {
          totalUsed: batch.totalUsed + 1,
          totalRemaining: Math.max(0, batch.totalRemaining - 1),
        },
      });
    }

    return updated;
  }
}
EOT

write_file apps/api/src/modules/tamper-tags/tamper-tags.controller.ts <<'EOT'
import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { TamperTagsService } from "./tamper-tags.service";

@Controller("tamper-tags")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TamperTagsController {
  constructor(private readonly tamperTagsService: TamperTagsService) {}

  @Get("batches")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async listBatches() {
    const batches = await this.tamperTagsService.listBatches();
    return okResponse(batches, "Tamper tag batches loaded", { total: batches.length });
  }

  @Post("batches")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async createBatch(
    @Body() body: { batchCode: string; totalIssued: number; issuedToUserId?: string },
  ) {
    const batch = await this.tamperTagsService.createBatch(body);
    return okResponse(batch, "Tamper tag batch created");
  }

  @Post("register")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async registerTag(@Body() body: { batchId: string; tagCode: string }) {
    const tag = await this.tamperTagsService.registerTag(body);
    return okResponse(tag, "Tamper tag registered");
  }

  @Patch("use")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async useTag(@Body() body: { tagCode: string; shipmentId: string }) {
    const tag = await this.tamperTagsService.useTag(body.tagCode, body.shipmentId);
    return okResponse(tag, "Tamper tag consumed");
  }
}
EOT

echo "Writing devices..."
write_file apps/api/src/modules/devices/devices.module.ts <<'EOT'
import { Module } from "@nestjs/common";
import { DevicesController } from "./devices.controller";
import { DevicesService } from "./devices.service";

@Module({
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
EOT

write_file apps/api/src/modules/devices/devices.service.ts <<'EOT'
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.device.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  register(params: {
    deviceCode: string;
    deviceType: string;
    assignedUserId?: string;
    assignedBranchId?: string;
  }) {
    return this.prisma.device.create({
      data: {
        deviceCode: params.deviceCode,
        deviceType: params.deviceType,
        assignedUserId: params.assignedUserId,
        assignedBranchId: params.assignedBranchId,
      },
    });
  }

  async heartbeat(params: {
    deviceCode: string;
    batteryLevel?: number;
    connectivity?: string;
    pendingSyncs?: number;
  }) {
    const device = await this.prisma.device.findUnique({
      where: { deviceCode: params.deviceCode },
    });

    if (!device) {
      throw new NotFoundException("Device not found");
    }

    return this.prisma.device.update({
      where: { deviceCode: params.deviceCode },
      data: {
        batteryLevel: params.batteryLevel,
        connectivity: params.connectivity,
        pendingSyncs: params.pendingSyncs,
        lastSeenAt: new Date(),
      },
    });
  }
}
EOT

write_file apps/api/src/modules/devices/devices.controller.ts <<'EOT'
import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { DevicesService } from "./devices.service";

@Controller("devices")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @Roles("super_admin", "admin_manager", "fleet_supervisor", "warehouse_manager")
  async list() {
    const devices = await this.devicesService.list();
    return okResponse(devices, "Devices loaded", { total: devices.length });
  }

  @Post()
  @Roles("super_admin", "admin_manager", "fleet_supervisor", "warehouse_manager")
  async register(
    @Body()
    body: {
      deviceCode: string;
      deviceType: string;
      assignedUserId?: string;
      assignedBranchId?: string;
    },
  ) {
    const device = await this.devicesService.register(body);
    return okResponse(device, "Device registered");
  }

  @Patch("heartbeat")
  @Roles(
    "super_admin",
    "admin_manager",
    "fleet_supervisor",
    "warehouse_manager",
    "rider",
    "driver",
  )
  async heartbeat(
    @Body()
    body: {
      deviceCode: string;
      batteryLevel?: number;
      connectivity?: string;
      pendingSyncs?: number;
    },
  ) {
    const device = await this.devicesService.heartbeat(body);
    return okResponse(device, "Device heartbeat recorded");
  }
}
EOT

echo "Step 2 completed successfully."
