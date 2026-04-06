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
