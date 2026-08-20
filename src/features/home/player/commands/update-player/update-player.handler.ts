import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatePlayerCommand } from "@/features/home/player/commands/update-player/update-player.command";
import { Player } from "@/features/home/entities/player/player.entity";
import { Game } from "@/features/home/entities/game/game.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdatePlayerResponse } from "@/features/home/player/commands/update-player/update-player.response";
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

@CommandHandler(UpdatePlayerCommand)
export class UpdatePlayerHandler implements ICommandHandler<UpdatePlayerCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdatePlayerCommand) {
    const player = await Player.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(player, "Player not found");

    if (cmd.payload.name !== undefined) player.name = cmd.payload.name;
    if (cmd.payload.country !== undefined)
      player.country = cmd.payload.country;
    if (cmd.payload.title !== undefined) player.title = cmd.payload.title;
    if (cmd.payload.classicalRating !== undefined)
      player.classicalRating = cmd.payload.classicalRating;
    if (cmd.payload.classicalRatingChange !== undefined)
      player.classicalRatingChange = cmd.payload.classicalRatingChange;
    if (cmd.payload.rapidRating !== undefined)
      player.rapidRating = cmd.payload.rapidRating;
    if (cmd.payload.rapidRatingChange !== undefined)
      player.rapidRatingChange = cmd.payload.rapidRatingChange;
    if (cmd.payload.blitzRating !== undefined)
      player.blitzRating = cmd.payload.blitzRating;
    if (cmd.payload.blitzRatingChange !== undefined)
      player.blitzRatingChange = cmd.payload.blitzRatingChange;
    if (cmd.payload.rankChange !== undefined)
      player.rankChange = cmd.payload.rankChange;
    if (cmd.payload.birthDate !== undefined)
      player.birthDate = new Date(cmd.payload.birthDate);

    if (cmd.avatarPath) {
      const oldAvatar = player.avatarUrl;
      player.avatarUrl = cmd.avatarPath;
      if (oldAvatar) await deleteUploadedFile(oldAvatar).catch(() => {});
    }

    const saved = await player.save();

    const relatedGames = await Game.find({
      where: [{ whitePlayerId: cmd.id }, { blackPlayerId: cmd.id }],
      select: { id: true },
    });

    await Promise.all([
      this.cache.del(PLAYERS_RANKING_CACHE_KEY),
      this.cache.del(RANKING_FILTERS_CACHE_KEY),
      this.cache.del(PLAYERS_TOP_CACHE_KEY),
      this.cache.del(playerByIdCacheKey(cmd.id)),
      // Games denormalize player name/avatar/rating, so a player edit can
      // leave games caches stale until these are invalidated too.
      this.cache.del(GAMES_LIST_CACHE_KEY),
      this.cache.del(GAMES_FILTERS_CACHE_KEY),
      this.cache.del(GAMES_RECENT_CACHE_KEY),
      ...relatedGames.map((game) => this.cache.del(gameByIdCacheKey(game.id))),
    ]);

    return plainToInstance(UpdatePlayerResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
