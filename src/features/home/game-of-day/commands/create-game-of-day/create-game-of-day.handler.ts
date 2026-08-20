import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateGameOfDayCommand } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.command";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateGameOfDayResponse } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.response";
import { Cache } from "@nestjs/cache-manager";
import {
  ACTIVE_GAME_OF_DAY_CACHE_KEY,
  GAME_OF_DAYS_LIST_CACHE_KEY,
  gameOfDayByIdCacheKey,
} from "@/features/home/game-of-day/game-of-day.cache";

@CommandHandler(CreateGameOfDayCommand)
export class CreateGameOfDayHandler implements ICommandHandler<CreateGameOfDayCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateGameOfDayCommand) {
    const whitePlayerExists = await Player.existsBy({
      id: cmd.payload.whitePlayerId,
    });
    DoesNotExistException.ThrowIf(!whitePlayerExists, "White player not found");

    const blackPlayerExists = await Player.existsBy({
      id: cmd.payload.blackPlayerId,
    });
    DoesNotExistException.ThrowIf(!blackPlayerExists, "Black player not found");

    const isActive = cmd.payload.isActive ?? false;
    let flippedIds: number[] = [];
    if (isActive) {
      const previouslyActive = await GameOfDay.find({
        where: { isActive: true },
        select: { id: true },
      });
      flippedIds = previouslyActive.map((row) => row.id);
      await GameOfDay.update({ isActive: true }, { isActive: false });
    }

    const gameOfDay = GameOfDay.create({
      videoUrl: cmd.videoPath,
      thumbnailUrl: cmd.thumbnailPath,
      durationSeconds: cmd.payload.durationSeconds,
      liveStartTime: new Date(cmd.payload.liveStartTime),
      gameType: cmd.payload.gameType,
      whitePlayerId: cmd.payload.whitePlayerId,
      blackPlayerId: cmd.payload.blackPlayerId,
      isActive,
    });
    const saved = await GameOfDay.save(gameOfDay);

    await Promise.all([
      this.cache.del(ACTIVE_GAME_OF_DAY_CACHE_KEY),
      this.cache.del(GAME_OF_DAYS_LIST_CACHE_KEY),
      // Rows silently flipped to isActive:false above need their own byId
      // cache entry cleared too, or they'd keep serving a stale isActive:true.
      ...flippedIds.map((id) => this.cache.del(gameOfDayByIdCacheKey(id))),
    ]);

    return plainToInstance(CreateGameOfDayResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
