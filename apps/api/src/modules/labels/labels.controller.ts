import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { LabelsService } from "./labels.service";

@Controller("labels")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get("shipment")
  @Roles("warehouse_manager", "dispatch_supervisor", "scanner_operator", "super_admin")
  async shipmentLabel(@Query("awb") awb: string) {
    const label = await this.labelsService.shipmentLabel(awb);
    return okResponse(label, "Shipment label generated");
  }
}
