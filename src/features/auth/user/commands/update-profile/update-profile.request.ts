import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProfileRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  fullName?: string;

  @ApiProperty({ type: "string", format: "binary", required: false })
  @IsOptional()
  avatar?: any;
}
