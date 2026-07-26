import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateLanguageRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  code: string;
}
