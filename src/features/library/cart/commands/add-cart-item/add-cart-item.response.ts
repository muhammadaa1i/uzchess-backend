import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AddCartItemResponse {
  @ApiProperty()
  @Expose()
  bookId: number;

  @ApiProperty()
  @Expose()
  message: string;
}
