import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { BranchScopeGuard } from "src/common/guards/branch-scope.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { BranchScoped } from "src/common/decorators/branch-scoped.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { ShipmentsService } from "./shipments.service";
@Controller("shipments")
@UseGuards(JwtAuthGuard, RolesGuard, BranchScopeGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}
  @Get(":branchId/list")
  @Roles("rider","driver","warehouse_manager","receiving_clerk","sorting_staff","inventory_controller","dispatch_coordinator","data_entry_clerk","operations_supervisor","branch_supervisor","hr_manager")
  @BranchScoped()
  async findByBranch(@Param("branchId") branchId: string) { const shipments = await this.shipmentsService.findByBranch(branchId); return okResponse(shipments, "Shipments loaded", { total: shipments.length, branchId }); }
  @Get("track/by-awb")
  async findByAwb(@Query("awb") awb: string) { const shipment = await this.shipmentsService.findByAwb(awb); return okResponse(shipment, "Shipment tracking loaded"); }
}
