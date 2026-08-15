import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";

export class UpdateBannerRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  subtitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  linkUrl?: string;

  @ApiProperty({ required: false, example: "1000$" })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  badgeText?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === true || value === "true",
  )
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: "string", format: "binary", required: false })
  image?: any;
}
