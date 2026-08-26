import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateNewsRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  excerpt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiProperty({ type: "string", format: "binary", required: false })
  image?: any;
}
