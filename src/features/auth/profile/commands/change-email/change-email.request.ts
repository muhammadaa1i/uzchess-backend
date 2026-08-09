import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangeEmailRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  currentPassword: string;

  @IsEmail()
  @ApiProperty()
  newEmail: string;
}
