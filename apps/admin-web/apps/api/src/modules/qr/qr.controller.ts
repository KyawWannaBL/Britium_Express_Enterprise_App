import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { QrService } from "./qr.service";

@Controller("qr")
@UseGuards(JwtAuthGuard, RolesGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get()
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async list() {
    const codes = await this.qrService.list();
    return okResponse(codes, "QR codes loaded", { total: codes.length });
  }

  @Post("shipment")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async createShipmentQr(@Body() body: { awb: string }) {
    const qr = await this.qrService.createShipmentQr(body.awb);
    return okResponse(qr, "Shipment QR created");
  }
}
