import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateRatingResponse {
  @ApiProperty()
  @Expose()
  bookId: number;

  @ApiProperty()
  @Expose()
  score: number;

  @ApiProperty()
  @Expose()
  averageRating: number;

  @ApiProperty()
  @Expose()
  ratingsCount: number;
}
