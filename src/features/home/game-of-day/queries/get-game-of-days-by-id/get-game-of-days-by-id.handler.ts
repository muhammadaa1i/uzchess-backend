import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGameOfDaysByIdQuery } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.query";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { plainToInstance } from "class-transformer";
import { GetGameOfDaysByIdResponse } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { gameOfDayByIdCacheKey } from "@/features/home/game-of-day/game-of-day.cache";

@QueryHandler(GetGameOfDaysByIdQuery)
export class GetGameOfDaysByIdHandler implements IQueryHandler<GetGameOfDaysByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetGameOfDaysByIdQuery) {
    const cacheKey = gameOfDayByIdCacheKey(query.id);
    const cached = await this.cache.get<GetGameOfDaysByIdResponse>(cacheKey);
    if (cached) return cached;

    const gameOfDay = await GameOfDay.findOne({
      where: { id: query.id },
      relations: { whitePlayer: true, blackPlayer: true },
    });
    DoesNotExistException.ThrowIfNull(gameOfDay, "Game of the day not found");

    const result = plainToInstance(
      GetGameOfDaysByIdResponse,
      {
        ...gameOfDay,
        whitePlayerName: gameOfDay.whitePlayer.name,
        whitePlayerAvatarUrl: gameOfDay.whitePlayer.avatarUrl,
        whitePlayerRating: gameOfDay.whitePlayer.classicalRating,
        blackPlayerName: gameOfDay.blackPlayer.name,
        blackPlayerAvatarUrl: gameOfDay.blackPlayer.avatarUrl,
        blackPlayerRating: gameOfDay.blackPlayer.classicalRating,
      },
      { excludeExtraneousValues: true },
    );

    await this.cache.set(cacheKey, result);

    return result;
  }
}
