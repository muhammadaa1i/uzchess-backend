import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateCategoryResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;
}

