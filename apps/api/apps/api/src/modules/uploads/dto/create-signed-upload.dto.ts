import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSignedUploadDto {
  @IsIn(["IMAGE", "PDF", "DOCUMENT", "SIGNATURE", "LABEL", "QR"])
  kind!: "IMAGE" | "PDF" | "DOCUMENT" | "SIGNATURE" | "LABEL" | "QR";

  @IsString()
  @MaxLength(120)
  mimeType!: string;

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsOptional()
  @IsString()
  dataEntryRecordId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
