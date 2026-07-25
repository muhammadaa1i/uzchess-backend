import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthorRequest {
  @ApiProperty()
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  fullName: string;
}
