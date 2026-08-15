import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetRankingFiltersQuery } from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { PlayerTitle } from "@/core/enums/player-title.enum";
import { plainToInstance } from "class-transformer";
import { GetRankingFiltersResponse } from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.response";

@QueryHandler(GetRankingFiltersQuery)
export class GetRankingFiltersHandler implements IQueryHandler<GetRankingFiltersQuery> {
  async execute() {
    const rows = await Player.createQueryBuilder("player")
      .select("DISTINCT player.country", "country")
      .orderBy("player.country", "ASC")
      .getRawMany<{ country: string }>();

    return plainToInstance(
      GetRankingFiltersResponse,
      {
        countries: rows.map((row) => row.country),
        titles: Object.values(PlayerTitle),
      },
      { excludeExtraneousValues: true },
    );
  }
}
