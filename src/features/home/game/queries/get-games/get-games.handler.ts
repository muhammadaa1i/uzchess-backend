import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGamesQuery } from "@/features/home/game/queries/get-games/get-games.query";
import { Game } from "@/features/home/entities/game/game.entity";
import { plainToInstance } from "class-transformer";
import { GetGamesResponse } from "@/features/home/game/queries/get-games/get-games.response";

@QueryHandler(GetGamesQuery)
export class GetGamesHandler implements IQueryHandler<GetGamesQuery> {
  async execute() {
    const games = await Game.find({
      relations: { whitePlayer: true, blackPlayer: true },
      order: { playedAt: "DESC" },
    });

    return plainToInstance(
      GetGamesResponse,
      games.map((game) => ({
        ...game,
        whitePlayerName: game.whitePlayer.name,
        whitePlayerAvatarUrl: game.whitePlayer.avatarUrl,
        whitePlayerRating: game.whitePlayer.classicalRating,
        blackPlayerName: game.blackPlayer.name,
        blackPlayerAvatarUrl: game.blackPlayer.avatarUrl,
        blackPlayerRating: game.blackPlayer.classicalRating,
      })),
      { excludeExtraneousValues: true },
    );
  }
}
