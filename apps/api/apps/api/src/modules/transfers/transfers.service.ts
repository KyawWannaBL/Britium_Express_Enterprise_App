import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.transfer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fromBranch: true,
        toBranch: true,
      },
    });
  }

  create(params: {
    transferNo: string;
    fromBranchId?: string;
    toBranchId?: string;
  }) {
    return this.prisma.transfer.create({
      data: {
        transferNo: params.transferNo,
        fromBranchId: params.fromBranchId,
        toBranchId: params.toBranchId,
        status: "CREATED",
      },
    });
  }

  async dispatch(id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) {
      throw new NotFoundException("Transfer not found");
    }

    return this.prisma.transfer.update({
      where: { id },
      data: {
        status: "DISPATCHED",
        departureAt: new Date(),
      },
    });
  }

  async receive(id: string) {
    const transfer = await this.prisma.transfer.findUnique({ where: { id } });
    if (!transfer) {
      throw new NotFoundException("Transfer not found");
    }

    return this.prisma.transfer.update({
      where: { id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
    });
  }
}
