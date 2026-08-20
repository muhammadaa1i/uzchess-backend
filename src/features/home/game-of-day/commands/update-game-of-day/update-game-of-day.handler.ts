import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateGameOfDayCommand } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.command";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { Not } from "typeorm";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateGameOfDayResponse } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  ACTIVE_GAME_OF_DAY_CACHE_KEY,
  GAME_OF_DAYS_LIST_CACHE_KEY,
  gameOfDayByIdCacheKey,
} from "@/features/home/game-of-day/game-of-day.cache";

@CommandHandler(UpdateGameOfDayCommand)
export class UpdateGameOfDayHandler implements ICommandHandler<UpdateGameOfDayCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateGameOfDayCommand) {
    const gameOfDay = await GameOfDay.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(gameOfDay, "Game of the day not found");

    if (cmd.payload.whitePlayerId !== undefined) {
      const whitePlayerExists = await Player.existsBy({
        id: cmd.payload.whitePlayerId,
      });
      DoesNotExistException.ThrowIf(
        !whitePlayerExists,
        "White player not found",
      );
    }

    if (cmd.payload.blackPlayerId !== undefined) {
      const blackPlayerExists = await Player.existsBy({
        id: cmd.payload.blackPlayerId,
      });
      DoesNotExistException.ThrowIf(
        !blackPlayerExists,
        "Black player not found",
      );
    }

    let flippedIds: number[] = [];
    if (cmd.payload.isActive === true) {
      const previouslyActive = await GameOfDay.find({
        where: { isActive: true, id: Not(cmd.id) },
        select: { id: true },
      });
      flippedIds = previouslyActive.map((row) => row.id);
      await GameOfDay.update(
        { isActive: true, id: Not(cmd.id) },
        { isActive: false },
      );
    }

    if (cmd.payload.whitePlayerId !== undefined)
      gameOfDay.whitePlayerId = cmd.payload.whitePlayerId;
    if (cmd.payload.blackPlayerId !== undefined)
      gameOfDay.blackPlayerId = cmd.payload.blackPlayerId;
    if (cmd.payload.durationSeconds !== undefined)
      gameOfDay.durationSeconds = cmd.payload.durationSeconds;
    if (cmd.payload.liveStartTime !== undefined)
      gameOfDay.liveStartTime = new Date(cmd.payload.liveStartTime);
    if (cmd.payload.gameType !== undefined)
      gameOfDay.gameType = cmd.payload.gameType;
    if (cmd.payload.isActive !== undefined)
      gameOfDay.isActive = cmd.payload.isActive;

    if (cmd.videoPath) {
      const oldVideo = gameOfDay.videoUrl;
      gameOfDay.videoUrl = cmd.videoPath;
      await deleteUploadedFile(oldVideo).catch(() => {});
    }

    if (cmd.thumbnailPath) {
      const oldThumbnail = gameOfDay.thumbnailUrl;
      gameOfDay.thumbnailUrl = cmd.thumbnailPath;
      await deleteUploadedFile(oldThumbnail).catch(() => {});
    }

    const saved = await gameOfDay.save();

    await Promise.all([
      this.cache.del(ACTIVE_GAME_OF_DAY_CACHE_KEY),
      this.cache.del(GAME_OF_DAYS_LIST_CACHE_KEY),
      this.cache.del(gameOfDayByIdCacheKey(cmd.id)),
      // Rows silently flipped to isActive:false above need their own byId
      // cache entry cleared too, or they'd keep serving a stale isActive:true.
      ...flippedIds.map((id) => this.cache.del(gameOfDayByIdCacheKey(id))),
    ]);

    return plainToInstance(UpdateGameOfDayResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
