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
