import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGameOfDaysQuery } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.query";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { plainToInstance } from "class-transformer";
import { GetGameOfDaysResponse } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.response";

@QueryHandler(GetGameOfDaysQuery)
export class GetGameOfDaysHandler implements IQueryHandler<GetGameOfDaysQuery> {
  async execute() {
    const gamesOfDay = await GameOfDay.find({
      relations: { whitePlayer: true, blackPlayer: true },
      order: { createdAt: "DESC" },
    });

    return plainToInstance(
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
  }
}
