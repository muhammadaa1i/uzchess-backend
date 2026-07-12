import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeleteCategoryResponse {
  @ApiProperty()
  @Expose()
  message: string;
}

