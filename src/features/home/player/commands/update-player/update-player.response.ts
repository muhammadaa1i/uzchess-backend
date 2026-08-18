import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { PlayerTitle } from "@/core/enums/player-title.enum";

export class UpdatePlayerResponse {
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
  country: string;

  @ApiProperty({ enum: PlayerTitle })
  @Expose()
  title: PlayerTitle;

  @ApiProperty()
  @Expose()
  classicalRating: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  classicalRatingChange: number | null;

  @ApiProperty()
  @Expose()
  rapidRating: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  rapidRatingChange: number | null;

  @ApiProperty()
  @Expose()
  blitzRating: number;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  blitzRatingChange: number | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  rankChange: number | null;

  @ApiProperty({ nullable: true })
  @Expose()
  birthDate: Date | null;
}
