import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { RolesService } from "./roles.service";
@Controller("roles")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Get()
  @Roles("super_admin", "hr_manager", "admin_manager")
  async findAll() { const roles = await this.rolesService.findAll(); return okResponse(roles, "Roles loaded", { total: roles.length }); }
}
