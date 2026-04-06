import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { okResponse } from "src/common/dto/api-response.dto";
import { TamperTagsService } from "./tamper-tags.service";

@Controller("tamper-tags")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TamperTagsController {
  constructor(private readonly tamperTagsService: TamperTagsService) {}

  @Get("batches")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async listBatches() {
    const batches = await this.tamperTagsService.listBatches();
    return okResponse(batches, "Tamper tag batches loaded", { total: batches.length });
  }

  @Post("batches")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async createBatch(
    @Body() body: { batchCode: string; totalIssued: number; issuedToUserId?: string },
  ) {
    const batch = await this.tamperTagsService.createBatch(body);
    return okResponse(batch, "Tamper tag batch created");
  }

  @Post("register")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async registerTag(@Body() body: { batchId: string; tagCode: string }) {
    const tag = await this.tamperTagsService.registerTag(body);
    return okResponse(tag, "Tamper tag registered");
  }

  @Patch("use")
  @Roles("warehouse_manager", "dispatch_supervisor", "super_admin")
  async useTag(@Body() body: { tagCode: string; shipmentId: string }) {
    const tag = await this.tamperTagsService.useTag(body.tagCode, body.shipmentId);
    return okResponse(tag, "Tamper tag consumed");
  }
}
