import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { okResponse } from "src/common/dto/api-response.dto";
import { BranchesService } from "./branches.service";
@Controller("branches")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}
  @Get()
  async findAll() { const branches = await this.branchesService.findAll(); return okResponse(branches, "Branches loaded", { total: branches.length }); }
  @Get(":id")
  async findOne(@Param("id") id: string) { const branch = await this.branchesService.findById(id); return okResponse(branch, "Branch loaded"); }
}
