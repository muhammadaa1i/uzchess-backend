import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class OrderItemDto {
  @ApiProperty()
  @Expose()
  bookId: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  cover: string;

  @ApiProperty()
  @Expose()
  price: number;
}
