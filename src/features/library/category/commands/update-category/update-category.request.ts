import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryRequest {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  @IsNotEmpty()
  title: string;
}
