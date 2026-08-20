import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetActiveGameOfDayQuery } from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.query";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { plainToInstance } from "class-transformer";
import { GetActiveGameOfDayResponse } from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { ACTIVE_GAME_OF_DAY_CACHE_KEY } from "@/features/home/game-of-day/game-of-day.cache";

@QueryHandler(GetActiveGameOfDayQuery)
export class GetActiveGameOfDayHandler implements IQueryHandler<GetActiveGameOfDayQuery> {
  constructor(private readonly cache: Cache) {}

  async execute() {
    const cached = await this.cache.get<GetActiveGameOfDayResponse>(
      ACTIVE_GAME_OF_DAY_CACHE_KEY,
    );
    if (cached) return cached;

    const gameOfDay = await GameOfDay.findOne({
      where: { isActive: true },
      relations: { whitePlayer: true, blackPlayer: true },
    });
    DoesNotExistException.ThrowIfNull(
      gameOfDay,
      "No active game of the day found",
    );

    const result = plainToInstance(
      GetActiveGameOfDayResponse,
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

    await this.cache.set(ACTIVE_GAME_OF_DAY_CACHE_KEY, result);

    return result;
  }
}
