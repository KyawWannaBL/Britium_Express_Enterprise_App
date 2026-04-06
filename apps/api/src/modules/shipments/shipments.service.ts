import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}
  findByBranch(branchId: string) { return this.prisma.shipment.findMany({ where: { branchId }, orderBy: { createdAt: "desc" }, include: { tasks: true, attachments: true, pod: true, warehouseEvents: true } }); }
  findByAwb(awb: string) { return this.prisma.shipment.findUnique({ where: { awb }, include: { tasks: true, attachments: true, pod: true, ndrCases: true, warehouseEvents: true, scanEvents: true } }); }
}
