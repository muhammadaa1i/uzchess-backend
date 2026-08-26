import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateNewsRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  excerpt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsDateString()
  publishedAt: string;

  @ApiProperty({ type: "string", format: "binary", required: false })
  image?: any;
}
