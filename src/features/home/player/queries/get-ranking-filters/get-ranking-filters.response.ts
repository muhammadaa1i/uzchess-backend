import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { PlayerTitle } from "@/core/enums/player-title/player-title.enum";

export class GetRankingFiltersResponse {
  @ApiProperty({
    type: [String],
    description: "Distinct country codes currently used by ranked players",
  })
  @Expose()
  countries: string[];

  @ApiProperty({ enum: PlayerTitle, isArray: true })
  @Expose()
  titles: PlayerTitle[];
}
