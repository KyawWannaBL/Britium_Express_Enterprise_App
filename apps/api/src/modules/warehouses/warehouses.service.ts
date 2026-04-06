import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}
  async inboundScan(awb: string, stationCode?: string, actorUserId?: string) {
    const s = await this.prisma.shipment.findUnique({ where: { awb } });
    if (!s) throw new NotFoundException("Shipment not found");
    await this.prisma.scanEvent.create({ data: { shipmentId: s.id, eventType: "INBOUND", result: "SUCCESS", actorUserId } });
    return this.prisma.shipment.update({ where: { id: s.id }, data: { status: "PROCESSING" } });
  }
}
