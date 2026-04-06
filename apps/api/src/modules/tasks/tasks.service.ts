import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}
  findMine(userId: string) { return this.prisma.task.findMany({ where: { assignedToId: userId }, orderBy: { createdAt: "desc" }, include: { shipment: true } }); }
  findByPortal(portal: string) { return this.prisma.task.findMany({ where: { portal }, orderBy: { createdAt: "desc" }, include: { shipment: true } }); }
  updateStatus(id: string, status: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: status as any, completedAt: ["SUCCESSFUL", "FAILED", "APPROVED", "REJECTED"].includes(status) ? new Date() : null },
    });
  }
}
