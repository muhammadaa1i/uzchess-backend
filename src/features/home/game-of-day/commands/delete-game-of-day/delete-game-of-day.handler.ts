import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteGameOfDayCommand } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.command";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { plainToInstance } from "class-transformer";
import { DeleteGameOfDayResponse } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  ACTIVE_GAME_OF_DAY_CACHE_KEY,
  GAME_OF_DAYS_LIST_CACHE_KEY,
  gameOfDayByIdCacheKey,
} from "@/features/home/game-of-day/game-of-day.cache";

@CommandHandler(DeleteGameOfDayCommand)
export class DeleteGameOfDayHandler implements ICommandHandler<DeleteGameOfDayCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteGameOfDayCommand) {
    const gameOfDay = await GameOfDay.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(gameOfDay, "Game of the day not found");

    await GameOfDay.remove(gameOfDay);
    await deleteUploadedFile(gameOfDay.videoUrl).catch(() => {});
    await deleteUploadedFile(gameOfDay.thumbnailUrl).catch(() => {});

    await Promise.all([
      this.cache.del(ACTIVE_GAME_OF_DAY_CACHE_KEY),
      this.cache.del(GAME_OF_DAYS_LIST_CACHE_KEY),
      this.cache.del(gameOfDayByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(DeleteGameOfDayResponse, {
      message: "Game of the day deleted successfully",
    });
  }
}
