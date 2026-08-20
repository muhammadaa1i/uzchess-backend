import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGameOfDaysQuery } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.query";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { plainToInstance } from "class-transformer";
import { GetGameOfDaysResponse } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.response";
import { Cache } from "@nestjs/cache-manager";
import { GAME_OF_DAYS_LIST_CACHE_KEY } from "@/features/home/game-of-day/game-of-day.cache";

@QueryHandler(GetGameOfDaysQuery)
export class GetGameOfDaysHandler implements IQueryHandler<GetGameOfDaysQuery> {
  constructor(private readonly cache: Cache) {}

  async execute() {
    const cached = await this.cache.get<GetGameOfDaysResponse[]>(
      GAME_OF_DAYS_LIST_CACHE_KEY,
    );
    if (cached) return cached;

    const gamesOfDay = await GameOfDay.find({
      relations: { whitePlayer: true, blackPlayer: true },
      order: { createdAt: "DESC" },
    });

    const result = plainToInstance(
      GetGameOfDaysResponse,
      gamesOfDay.map((gameOfDay) => ({
        ...gameOfDay,
        whitePlayerName: gameOfDay.whitePlayer.name,
        whitePlayerAvatarUrl: gameOfDay.whitePlayer.avatarUrl,
        whitePlayerRating: gameOfDay.whitePlayer.classicalRating,
        blackPlayerName: gameOfDay.blackPlayer.name,
        blackPlayerAvatarUrl: gameOfDay.blackPlayer.avatarUrl,
        blackPlayerRating: gameOfDay.blackPlayer.classicalRating,
      })),
      { excludeExtraneousValues: true },
    );

    await this.cache.set(GAME_OF_DAYS_LIST_CACHE_KEY, result);

    return result;
  }
}
