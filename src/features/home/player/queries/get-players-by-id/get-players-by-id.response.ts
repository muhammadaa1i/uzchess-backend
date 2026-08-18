import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetPlayersByIdResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty()
  @Expose()
  classicalRating: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  classicalRatingChange: number | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  rankChange: number | null;

  @ApiProperty({ nullable: true })
  @Expose()
  birthDate: Date | null;
}
