import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGamesByIdQuery } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.query";
import { Game } from "@/features/home/entities/game/game.entity";
import { plainToInstance } from "class-transformer";
import { GetGamesByIdResponse } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { gameByIdCacheKey } from "@/features/home/game/game.cache";
import { ratingForGameType } from "@/core/utils/game-rating/game-rating.util";

@QueryHandler(GetGamesByIdQuery)
export class GetGamesByIdHandler implements IQueryHandler<GetGamesByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetGamesByIdQuery) {
    const cacheKey = gameByIdCacheKey(query.id);
    const cached = await this.cache.get<GetGamesByIdResponse>(cacheKey);
    if (cached) return cached;

    const game = await Game.findOne({
      where: { id: query.id },
      relations: { whitePlayer: true, blackPlayer: true },
    });
    DoesNotExistException.ThrowIfNull(game, "Game not found");

    const result = plainToInstance(
      GetGamesByIdResponse,
      {
        ...game,
        whitePlayerName: game.whitePlayer.name,
        whitePlayerAvatarUrl: game.whitePlayer.avatarUrl,
        whitePlayerRating: ratingForGameType(game.whitePlayer, game.gameType),
        blackPlayerName: game.blackPlayer.name,
        blackPlayerAvatarUrl: game.blackPlayer.avatarUrl,
        blackPlayerRating: ratingForGameType(game.blackPlayer, game.gameType),
      },
      { excludeExtraneousValues: true },
    );

    await this.cache.set(cacheKey, result);

    return result;
  }
}
