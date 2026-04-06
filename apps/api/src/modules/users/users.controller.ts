import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { UsersService } from "./users.service";
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @Roles("super_admin", "hr_manager", "admin_manager", "people_ops_lead")
  async findAll() { const users = await this.usersService.findAll(); return okResponse(users, "Users loaded", { total: users.length }); }
  @Get(":id")
  @Roles("super_admin", "hr_manager", "admin_manager", "people_ops_lead")
  async findOne(@Param("id") id: string) { const user = await this.usersService.findById(id); return okResponse(user, "User loaded"); }
}
