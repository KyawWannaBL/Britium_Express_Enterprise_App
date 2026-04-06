import { Controller, Get, Param, Post, UseGuards, Body } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuthUser } from "src/common/types/auth-user.type";
import { okResponse } from "src/common/dto/api-response.dto";
import { UploadsService } from "./uploads.service";
import { CreateSignedUploadDto } from "./dto/create-signed-upload.dto";

@Controller("uploads")
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("signed-upload")
  async signedUpload(
    @Body() body: CreateSignedUploadDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.uploadsService.createSignedUpload({
      ...body,
      uploadedById: user.sub,
    });

    return okResponse(result, "Signed upload URL created");
  }

  @Get("signed-download/:attachmentId")
  async signedDownload(@Param("attachmentId") attachmentId: string) {
    const result = await this.uploadsService.createSignedDownload(attachmentId);
    return okResponse(result, "Signed download URL created");
  }
}
