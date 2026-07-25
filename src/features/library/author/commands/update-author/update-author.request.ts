import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateAuthorRequest {
  @ApiProperty()
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  fullName: string;
}
