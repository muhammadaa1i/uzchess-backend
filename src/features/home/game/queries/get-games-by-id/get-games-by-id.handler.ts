import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGamesByIdQuery } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.query";
import { Game } from "@/features/home/entities/game/game.entity";
import { plainToInstance } from "class-transformer";
import { GetGamesByIdResponse } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetGamesByIdQuery)
export class GetGamesByIdHandler implements IQueryHandler<GetGamesByIdQuery> {
  async execute(query: GetGamesByIdQuery) {
    const game = await Game.findOne({
      where: { id: query.id },
      relations: { whitePlayer: true, blackPlayer: true },
    });
    DoesNotExistException.ThrowIfNull(game, "Game not found");

    return plainToInstance(
      GetGamesByIdResponse,
      {
        ...game,
        whitePlayerName: game.whitePlayer.name,
        whitePlayerAvatarUrl: game.whitePlayer.avatarUrl,
        whitePlayerRating: game.whitePlayer.classicalRating,
        blackPlayerName: game.blackPlayer.name,
        blackPlayerAvatarUrl: game.blackPlayer.avatarUrl,
        blackPlayerRating: game.blackPlayer.classicalRating,
      },
      { excludeExtraneousValues: true },
    );
  }
}
