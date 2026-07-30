import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RegisterCommand } from "@/features/auth/user/commands/register/register.command";

export class RegisterRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ApiProperty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @ApiProperty()
  password: string;

  toCommand() {
    return new RegisterCommand(this);
  }
}
