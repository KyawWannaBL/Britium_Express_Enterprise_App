import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { DevicesService } from "./devices.service";

@Controller("devices")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @Roles("super_admin", "admin_manager", "fleet_supervisor", "warehouse_manager")
  async list() {
    const devices = await this.devicesService.list();
    return okResponse(devices, "Devices loaded", { total: devices.length });
  }

  @Post()
  @Roles("super_admin", "admin_manager", "fleet_supervisor", "warehouse_manager")
  async register(
    @Body()
    body: {
      deviceCode: string;
      deviceType: string;
      assignedUserId?: string;
      assignedBranchId?: string;
    },
  ) {
    const device = await this.devicesService.register(body);
    return okResponse(device, "Device registered");
  }

  @Patch("heartbeat")
  @Roles(
    "super_admin",
    "admin_manager",
    "fleet_supervisor",
    "warehouse_manager",
    "rider",
    "driver",
  )
  async heartbeat(
    @Body()
    body: {
      deviceCode: string;
      batteryLevel?: number;
      connectivity?: string;
      pendingSyncs?: number;
    },
  ) {
    const device = await this.devicesService.heartbeat(body);
    return okResponse(device, "Device heartbeat recorded");
  }
}
