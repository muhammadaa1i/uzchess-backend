import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetRankingFiltersQuery } from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { PlayerTitle } from "@/core/enums/player-title/player-title.enum";
import { plainToInstance } from "class-transformer";
import { GetRankingFiltersResponse } from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.response";
import { Cache } from "@nestjs/cache-manager";
import { RANKING_FILTERS_CACHE_KEY } from "@/features/home/player/player.cache";

@QueryHandler(GetRankingFiltersQuery)
export class GetRankingFiltersHandler implements IQueryHandler<GetRankingFiltersQuery> {
  constructor(private readonly cache: Cache) {}

  async execute() {
    const cached = await this.cache.get<GetRankingFiltersResponse>(
      RANKING_FILTERS_CACHE_KEY,
    );
    if (cached) return cached;

    const rows = await Player.createQueryBuilder("player")
      .select("DISTINCT player.country", "country")
      .orderBy("player.country", "ASC")
      .getRawMany<{ country: string }>();

    const result = plainToInstance(
      GetRankingFiltersResponse,
      {
        countries: rows.map((row) => row.country),
        titles: Object.values(PlayerTitle),
      },
      { excludeExtraneousValues: true },
    );

    await this.cache.set(RANKING_FILTERS_CACHE_KEY, result);

    return result;
  }
}
