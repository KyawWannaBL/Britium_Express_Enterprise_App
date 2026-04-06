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
