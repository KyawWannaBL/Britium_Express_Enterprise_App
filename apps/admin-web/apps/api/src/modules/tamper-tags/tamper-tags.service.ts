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
