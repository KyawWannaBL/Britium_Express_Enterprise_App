import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { TransfersService } from "./transfers.service";

@Controller("transfers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async list() {
    const transfers = await this.transfersService.list();
    return okResponse(transfers, "Transfers loaded", { total: transfers.length });
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
    @Body() body: { transferNo: string; fromBranchId?: string; toBranchId?: string },
  ) {
    const transfer = await this.transfersService.create(body);
    return okResponse(transfer, "Transfer created");
  }

  @Patch(":id/dispatch")
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async dispatch(@Param("id") id: string) {
    const transfer = await this.transfersService.dispatch(id);
    return okResponse(transfer, "Transfer dispatched");
  }

  @Patch(":id/receive")
  @Roles(
    "dispatch_supervisor",
    "branch_supervisor",
    "warehouse_manager",
    "senior_operations_manager",
    "super_admin",
  )
  async receive(@Param("id") id: string) {
    const transfer = await this.transfersService.receive(id);
    return okResponse(transfer, "Transfer received");
  }
}
