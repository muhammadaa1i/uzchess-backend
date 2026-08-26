import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetNewsRequest {
  @ApiProperty({ required: false, description: "Search news by title" })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  size?: number;
}
