import { IsOptional, IsString, MaxLength } from "class-validator";

export class MarkFailedDto {
  @IsString()
  @MaxLength(64)
  awb!: string;

  @IsString()
  @MaxLength(64)
  reasonCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  riderNote?: string;
}
