import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateLanguageCommand } from "@/features/library/languages/commands/update-language/update-language.command";
import { Language } from "../../../entities/languages/language.entity";
import { ILike, Not } from "typeorm";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateLanguageResponse } from "@/features/library/languages/commands/update-language/update-language.response";
import { Cache } from "@nestjs/cache-manager";
import {
  LANGUAGES_LIST_CACHE_KEY,
  languageByIdCacheKey,
} from "@/features/library/languages/languages.cache";

@CommandHandler(UpdateLanguageCommand)
export class UpdateLanguageHandler implements ICommandHandler<UpdateLanguageCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateLanguageCommand) {
    const language = await Language.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(language, "Language not found");

    const titleExists = await Language.existsBy({
      id: Not(cmd.id),
      title: ILike(cmd.payload.title),
    });
    const codeExists = await Language.existsBy({
      id: Not(cmd.id),
      code: ILike(cmd.payload.code),
    });
    AlreadyExistException.ThrowIf(
      titleExists || codeExists,
      "Language with this title or code already exists",
    );

    language.title = cmd.payload.title;
    language.code = cmd.payload.code;
    const saved = await language.save();

    await Promise.all([
      this.cache.del(LANGUAGES_LIST_CACHE_KEY),
      this.cache.del(languageByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(UpdateLanguageResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
