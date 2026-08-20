import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPlayersRankingQuery } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.query";
import { RankingSortBy } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.request";
import { Player } from "@/features/home/entities/player/player.entity";
import { FindOptionsWhere } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetPlayersRankingResponse } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";
import { Cache } from "@nestjs/cache-manager";
import {
  CachedPlayersRanking,
  PLAYERS_RANKING_CACHE_KEY,
} from "@/features/home/player/player.cache";

const SORT_COLUMN_BY_SORT_BY: Record<
  RankingSortBy,
  "classicalRating" | "rapidRating" | "blitzRating"
> = {
  [RankingSortBy.Classical]: "classicalRating",
  [RankingSortBy.Rapid]: "rapidRating",
  [RankingSortBy.Blitz]: "blitzRating",
};

@QueryHandler(GetPlayersRankingQuery)
export class GetPlayersRankingHandler implements IQueryHandler<GetPlayersRankingQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetPlayersRankingQuery) {
    const isDefaultQuery =
      !query.payload.country &&
      !query.payload.title &&
      !query.payload.sortBy &&
      !query.payload.page &&
      !query.payload.size;

    if (isDefaultQuery) {
      const cached = await this.cache.get<CachedPlayersRanking>(
        PLAYERS_RANKING_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const where: FindOptionsWhere<Player> = {};
    if (query.payload.country) where.country = query.payload.country;
    if (query.payload.title) where.title = query.payload.title;

    const sortField =
      SORT_COLUMN_BY_SORT_BY[query.payload.sortBy ?? RankingSortBy.Classical];

    const players = await Player.find({
      where,
      order: { [sortField]: "DESC" },
    });

    const take = query.payload.size ?? 10;
    const currentPage = query.payload.page ?? 1;
    const skip = (currentPage - 1) * take;
    const totalCount = players.length;
    const totalPages = Math.ceil(totalCount / take);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    const rankedPlayers = players.slice(skip, skip + take).map((player, index) => ({
      ...player,
      rank: skip + index + 1,
    }));

    const data = plainToInstance(GetPlayersRankingResponse, rankedPlayers, {
      excludeExtraneousValues: true,
    });

    const result = plainToInstance(
      PaginatedResultDto(GetPlayersRankingResponse),
      { totalCount, totalPages, currentPage, hasNext, hasPrevious, data },
      { excludeExtraneousValues: true },
    );

    if (isDefaultQuery)
      await this.cache.set(PLAYERS_RANKING_CACHE_KEY, result);

    return result;
  }
}
