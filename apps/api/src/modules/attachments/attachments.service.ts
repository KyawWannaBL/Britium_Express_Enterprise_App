import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}
  findByShipment(shipmentId: string) { return this.prisma.attachment.findMany({ where: { shipmentId }, orderBy: { createdAt: "desc" } }); }
  findByDataEntryRecord(dataEntryRecordId: string) { return this.prisma.attachment.findMany({ where: { dataEntryRecordId }, orderBy: { createdAt: "desc" } }); }
}
