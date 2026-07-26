import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteDifficultyCommand } from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.command";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { ConflictException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DeleteDifficultyResponse } from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { unlink } from "node:fs/promises";
import { Cache } from "@nestjs/cache-manager";
import {
  DIFFICULTIES_LIST_CACHE_KEY,
  difficultyByIdCacheKey,
} from "@/features/library/difficulty/difficulty.cache";

@CommandHandler(DeleteDifficultyCommand)
export class DeleteDifficultyHandler implements ICommandHandler<DeleteDifficultyCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteDifficultyCommand) {
    const difficulty = await Difficulty.findOneBy({ id: cmd.id });

    DoesNotExistException.ThrowIfNull(difficulty, "Difficulty not found");

    const inUse = await Book.existsBy({ difficultyId: cmd.id });
    if (inUse)
      throw new ConflictException(
        "Difficulty is still in use by one or more books",
      );

    await Difficulty.remove(difficulty);
    await unlink(difficulty.icon).catch(() => {});

    await Promise.all([
      this.cache.del(DIFFICULTIES_LIST_CACHE_KEY),
      this.cache.del(difficultyByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(DeleteDifficultyResponse, {
      message: "Difficulty deleted successfully",
    });
  }
}
