import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { SupervisorService } from "./supervisor.service";

@Controller("supervisor")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get("dashboard")
  @Roles(
    "operations_supervisor",
    "dispatch_supervisor",
    "fleet_supervisor",
    "planning_supervisor",
    "branch_supervisor",
    "senior_operations_manager",
    "super_admin",
  )
  async dashboard(@Query("branchId") branchId?: string) {
    const data = await this.supervisorService.getDashboard(branchId);
    return okResponse(data, "Supervisor dashboard loaded");
  }

  @Get("queue")
  @Roles(
    "operations_supervisor",
    "dispatch_supervisor",
    "fleet_supervisor",
    "planning_supervisor",
    "branch_supervisor",
    "senior_operations_manager",
    "super_admin",
  )
  async queue(@Query("branchId") branchId?: string) {
    const data = await this.supervisorService.getOperationalQueue(branchId);
    return okResponse(data, "Operational queue loaded", { total: data.length, branchId });
  }
}
