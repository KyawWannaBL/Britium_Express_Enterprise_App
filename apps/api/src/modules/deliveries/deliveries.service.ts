import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationsEventsService } from "src/modules/notifications/notifications.events.service";

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService, private readonly notificationsEvents: NotificationsEventsService) {}
  async markDelivered(params: any) {
    const shipment = await this.prisma.shipment.findUnique({ where: { awb: params.awb } });
    if (!shipment) throw new NotFoundException("Shipment not found");
    await this.prisma.proofOfDelivery.upsert({
      where: { shipmentId: shipment.id },
      update: { recipientName: params.recipientName, otpVerified: params.otpVerified ?? false },
      create: { shipmentId: shipment.id, recipientName: params.recipientName, otpVerified: params.otpVerified ?? false },
    });
    const updated = await this.prisma.shipment.update({ where: { id: shipment.id }, data: { status: "DELIVERED" } });
    if (params.riderUserId) await this.notificationsEvents.notifyUser({ userId: params.riderUserId, portal: "rider-driver", title: "Delivery Success", body: `AWB ${params.awb} delivered.` });
    return updated;
  }
  async markFailed(params: any) {
     const shipment = await this.prisma.shipment.findUnique({ where: { awb: params.awb } });
     if (!shipment) throw new NotFoundException("Shipment not found");
     await this.prisma.ndrCase.create({ data: { shipmentId: shipment.id, reasonCode: params.reasonCode, remark: params.remark } });
     return this.prisma.shipment.update({ where: { id: shipment.id }, data: { status: "FAILED" } });
  }
}
