import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateLanguageCommand } from "@/features/library/languages/commands/create-language/create-language.command";
import { Language } from "../../../entities/languages/language.entity";
import { ILike } from "typeorm";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateLanguageResponse } from "@/features/library/languages/commands/create-language/create-language.response";
import { Cache } from "@nestjs/cache-manager";
import { LANGUAGES_LIST_CACHE_KEY } from "@/features/library/languages/languages.cache";

@CommandHandler(CreateLanguageCommand)
export class CreateLanguageHandler implements ICommandHandler<CreateLanguageCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateLanguageCommand) {
    const titleExists = await Language.existsBy({
      title: ILike(cmd.payload.title),
    });
    const codeExists = await Language.existsBy({
      code: ILike(cmd.payload.code),
    });
    AlreadyExistException.ThrowIf(
      titleExists || codeExists,
      "Language with this title or code already exists",
    );

    const newLanguage = Language.create({
      title: cmd.payload.title,
      code: cmd.payload.code,
    });
    const saved = await Language.save(newLanguage);

    await this.cache.del(LANGUAGES_LIST_CACHE_KEY);

    return plainToInstance(CreateLanguageResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
