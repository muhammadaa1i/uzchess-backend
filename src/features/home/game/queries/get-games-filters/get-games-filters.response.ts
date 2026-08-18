import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class GetGamesFiltersResponse {
  @ApiProperty({
    type: [String],
    description: "Distinct country codes among players who have played a game",
  })
  @Expose()
  countries: string[];

  @ApiProperty({
    type: [Number],
    description: "Distinct ages among players who have played a game",
  })
  @Expose()
  ages: number[];
}
