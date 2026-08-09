import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ApiProperty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(128)
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @ApiProperty()
  password: string;
}
