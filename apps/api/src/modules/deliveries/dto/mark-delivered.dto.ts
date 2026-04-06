import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class MarkDeliveredDto {
  @IsString()
  @MaxLength(64)
  awb!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  relationship?: string;

  @IsOptional()
  @IsBoolean()
  otpVerified?: boolean;

  @IsOptional()
  @IsNumber()
  gpsLatitude?: number;

  @IsOptional()
  @IsNumber()
  gpsLongitude?: number;
}
