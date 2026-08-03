import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @ApiProperty()
  password: string;
}
