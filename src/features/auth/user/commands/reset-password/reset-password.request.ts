import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordRequest {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(128)
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @ApiProperty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  confirmNewPassword: string;
}
