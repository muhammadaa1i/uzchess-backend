import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryRequest {
  @ApiProperty()
  @MaxLength(64)
  @IsString()
  @IsNotEmpty()
  title: string;
}
