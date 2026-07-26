import { IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetAuthorsRequest {
  @IsString()
  @MaxLength(32)
  @IsOptional()
  @ApiProperty({ required: false })
  search?: string;
}
