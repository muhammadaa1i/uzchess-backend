import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateDifficultyCommand } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.command";
import { Difficulty } from "../../../entities/difficulty/difficulty.entity";
import { ILike } from "typeorm";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateDifficultyResponse } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.response";
import { Cache } from "@nestjs/cache-manager";
import { DIFFICULTIES_LIST_CACHE_KEY } from "@/features/library/difficulty/difficulty.cache";

@CommandHandler(CreateDifficultyCommand)
export class CreateDifficultyHandler implements ICommandHandler<CreateDifficultyCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateDifficultyCommand) {
    const alreadyExist = await Difficulty.existsBy({
      degree: ILike(cmd.payload.degree),
    });
    AlreadyExistException.ThrowIf(alreadyExist);

    const newDifficulty = {
      degree: cmd.payload.degree,
      icon: cmd.iconPath,
    } as Difficulty;
    const saved = await Difficulty.save(newDifficulty);

    await this.cache.del(DIFFICULTIES_LIST_CACHE_KEY);

    return plainToInstance(CreateDifficultyResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
