import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class AddFavouriteResponse {
  @ApiProperty()
  @Expose()
  bookId: number;

  @ApiProperty()
  @Expose()
  message: string;
}
