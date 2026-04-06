import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.device.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  register(params: {
    deviceCode: string;
    deviceType: string;
    assignedUserId?: string;
    assignedBranchId?: string;
  }) {
    return this.prisma.device.create({
      data: {
        deviceCode: params.deviceCode,
        deviceType: params.deviceType,
        assignedUserId: params.assignedUserId,
        assignedBranchId: params.assignedBranchId,
      },
    });
  }

  async heartbeat(params: {
    deviceCode: string;
    batteryLevel?: number;
    connectivity?: string;
    pendingSyncs?: number;
  }) {
    const device = await this.prisma.device.findUnique({
      where: { deviceCode: params.deviceCode },
    });

    if (!device) {
      throw new NotFoundException("Device not found");
    }

    return this.prisma.device.update({
      where: { deviceCode: params.deviceCode },
      data: {
        batteryLevel: params.batteryLevel,
        connectivity: params.connectivity,
        pendingSyncs: params.pendingSyncs,
        lastSeenAt: new Date(),
      },
    });
  }
}
