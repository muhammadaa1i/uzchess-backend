import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateDifficultyRequest {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(32)
  degree: string;

  @ApiProperty({ type: "string", format: "binary", required: false })
  @IsOptional()
  icon: any;
}
