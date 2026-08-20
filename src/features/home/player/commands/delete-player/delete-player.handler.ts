import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeletePlayerCommand } from "@/features/home/player/commands/delete-player/delete-player.command";
import { Player } from "@/features/home/entities/player/player.entity";
import { Game } from "@/features/home/entities/game/game.entity";
import { plainToInstance } from "class-transformer";
import { DeletePlayerResponse } from "@/features/home/player/commands/delete-player/delete-player.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  PLAYERS_RANKING_CACHE_KEY,
  PLAYERS_TOP_CACHE_KEY,
  RANKING_FILTERS_CACHE_KEY,
  playerByIdCacheKey,
} from "@/features/home/player/player.cache";
import {
  GAMES_FILTERS_CACHE_KEY,
  GAMES_LIST_CACHE_KEY,
  GAMES_RECENT_CACHE_KEY,
  gameByIdCacheKey,
} from "@/features/home/game/game.cache";

@CommandHandler(DeletePlayerCommand)
export class DeletePlayerHandler implements ICommandHandler<DeletePlayerCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeletePlayerCommand) {
    const player = await Player.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(player, "Player not found");

    // Games reference this player and cascade-delete at the DB level, so
    // their cache keys must be captured before the player row is removed.
    const relatedGames = await Game.find({
      where: [{ whitePlayerId: cmd.id }, { blackPlayerId: cmd.id }],
      select: { id: true },
    });

    await Player.remove(player);
    if (player.avatarUrl)
      await deleteUploadedFile(player.avatarUrl).catch(() => {});

    await Promise.all([
      this.cache.del(PLAYERS_RANKING_CACHE_KEY),
      this.cache.del(RANKING_FILTERS_CACHE_KEY),
      this.cache.del(PLAYERS_TOP_CACHE_KEY),
      this.cache.del(playerByIdCacheKey(cmd.id)),
      this.cache.del(GAMES_LIST_CACHE_KEY),
      this.cache.del(GAMES_FILTERS_CACHE_KEY),
      this.cache.del(GAMES_RECENT_CACHE_KEY),
      ...relatedGames.map((game) => this.cache.del(gameByIdCacheKey(game.id))),
    ]);

    return plainToInstance(DeletePlayerResponse, {
      message: "Player deleted successfully",
    });
  }
}
