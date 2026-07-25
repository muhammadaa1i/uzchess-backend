import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetCategoriesByIdResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;
}
