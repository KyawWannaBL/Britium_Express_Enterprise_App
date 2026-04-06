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
