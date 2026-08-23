import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGamesListQuery } from "@/features/home/game/queries/get-games-list/get-games-list.query";
import { GamesListSortBy } from "@/features/home/game/queries/get-games-list/get-games-list.request";
import { Game } from "@/features/home/entities/game/game.entity";
import { plainToInstance } from "class-transformer";
import { GetGamesListResponse } from "@/features/home/game/queries/get-games-list/get-games-list.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";
import { calculateAge } from "@/core/utils/game-age/game-age.util";
import { ratingForGameType } from "@/core/utils/game-rating/game-rating.util";
import { Cache } from "@nestjs/cache-manager";
import {
  CachedGamesList,
  GAMES_LIST_CACHE_KEY,
} from "@/features/home/game/game.cache";

@QueryHandler(GetGamesListQuery)
export class GetGamesListHandler implements IQueryHandler<GetGamesListQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetGamesListQuery) {
    const isDefaultQuery =
      !query.payload.country &&
      query.payload.age === undefined &&
      !query.payload.sortBy &&
      !query.payload.page &&
      !query.payload.size;

    if (isDefaultQuery) {
      const cached = await this.cache.get<CachedGamesList>(
        GAMES_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    let games = await Game.find({
      relations: { whitePlayer: true, blackPlayer: true },
    });

    if (query.payload.country) {
      games = games.filter(
        (game) =>
          game.whitePlayer.country === query.payload.country ||
          game.blackPlayer.country === query.payload.country,
      );
    }

    if (query.payload.age !== undefined) {
      games = games.filter(
        (game) =>
          calculateAge(game.whitePlayer.birthDate) === query.payload.age ||
          calculateAge(game.blackPlayer.birthDate) === query.payload.age,
      );
    }

    const sortBy = query.payload.sortBy ?? GamesListSortBy.Date;
    if (sortBy === GamesListSortBy.Moves) {
      games.sort((a, b) => b.movesCount - a.movesCount);
    } else if (sortBy === GamesListSortBy.GameType) {
      games.sort((a, b) => a.gameType.localeCompare(b.gameType));
    } else {
      games.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
    }

    const take = query.payload.size ?? 10;
    const currentPage = query.payload.page ?? 1;
    const skip = (currentPage - 1) * take;
    const totalCount = games.length;
    const totalPages = Math.ceil(totalCount / take);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    const pagedGames = games.slice(skip, skip + take).map((game) => ({
      ...game,
      whitePlayerName: game.whitePlayer.name,
      whitePlayerAvatarUrl: game.whitePlayer.avatarUrl,
      whitePlayerRating: ratingForGameType(game.whitePlayer, game.gameType),
      blackPlayerName: game.blackPlayer.name,
      blackPlayerAvatarUrl: game.blackPlayer.avatarUrl,
      blackPlayerRating: ratingForGameType(game.blackPlayer, game.gameType),
    }));

    const data = plainToInstance(GetGamesListResponse, pagedGames, {
      excludeExtraneousValues: true,
    });

    const result = plainToInstance(
      PaginatedResultDto(GetGamesListResponse),
      { totalCount, totalPages, currentPage, hasNext, hasPrevious, data },
      { excludeExtraneousValues: true },
    );

    if (isDefaultQuery) await this.cache.set(GAMES_LIST_CACHE_KEY, result);

    return result;
  }
}
