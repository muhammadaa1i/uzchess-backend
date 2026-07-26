import { IsInt, IsOptional, IsString, Max, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetCategoriesRequest {
  @IsString()
  @MaxLength(32)
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;
}
