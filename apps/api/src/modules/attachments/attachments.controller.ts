import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { okResponse } from "src/common/dto/api-response.dto";
import { AttachmentsService } from "./attachments.service";
@Controller("attachments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}
  @Get("shipment/:shipmentId")
  async findByShipment(@Param("shipmentId") shipmentId: string) { const attachments = await this.attachmentsService.findByShipment(shipmentId); return okResponse(attachments, "Shipment attachments loaded", { total: attachments.length }); }
  @Get("data-entry/:recordId")
  async findByDataEntryRecord(@Param("recordId") recordId: string) { const attachments = await this.attachmentsService.findByDataEntryRecord(recordId); return okResponse(attachments, "Data entry attachments loaded", { total: attachments.length }); }
}
