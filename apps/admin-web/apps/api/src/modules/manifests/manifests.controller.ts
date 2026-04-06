import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { ManifestsService } from "./manifests.service";

@Controller("manifests")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManifestsController {
  constructor(private readonly manifestsService: ManifestsService) {}

  @Get()
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async list() {
    const manifests = await this.manifestsService.list();
    return okResponse(manifests, "Manifests loaded", { total: manifests.length });
  }

  @Post()
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async create(
    @Body()
    body: {
      manifestNo: string;
      destinationBranchId?: string;
      bagCode?: string;
      sealCode?: string;
      vehicleId?: string;
    },
  ) {
    const manifest = await this.manifestsService.create(body);
    return okResponse(manifest, "Manifest created");
  }

  @Patch(":manifestId/attach-shipment")
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async attachShipment(
    @Param("manifestId") manifestId: string,
    @Body() body: { awb: string },
  ) {
    const manifest = await this.manifestsService.attachShipment(manifestId, body.awb);
    return okResponse(manifest, "Shipment attached to manifest");
  }
}
