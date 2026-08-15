import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGameOfDaysByIdQuery } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.query";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { plainToInstance } from "class-transformer";
import { GetGameOfDaysByIdResponse } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetGameOfDaysByIdQuery)
export class GetGameOfDaysByIdHandler implements IQueryHandler<GetGameOfDaysByIdQuery> {
  async execute(query: GetGameOfDaysByIdQuery) {
    const gameOfDay = await GameOfDay.findOne({
      where: { id: query.id },
      relations: { whitePlayer: true, blackPlayer: true },
    });
    DoesNotExistException.ThrowIfNull(gameOfDay, "Game of the day not found");

    return plainToInstance(
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
  }
}
