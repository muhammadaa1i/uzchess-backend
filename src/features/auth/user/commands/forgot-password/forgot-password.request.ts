import { IsEmail, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordRequest {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(128)
  @ApiProperty()
  email: string;
}
