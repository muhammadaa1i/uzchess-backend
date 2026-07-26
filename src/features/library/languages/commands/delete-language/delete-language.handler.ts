import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteLanguageCommand } from "@/features/library/languages/commands/delete-language/delete-language.command";
import { Language } from "../../../entities/languages/language.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { ConflictException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DeleteLanguageResponse } from "@/features/library/languages/commands/delete-language/delete-language.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import {
  LANGUAGES_LIST_CACHE_KEY,
  languageByIdCacheKey,
} from "@/features/library/languages/languages.cache";

@CommandHandler(DeleteLanguageCommand)
export class DeleteLanguageHandler implements ICommandHandler<DeleteLanguageCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteLanguageCommand) {
    const language = await Language.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(language, "Language not found");

    const inUse = await Book.existsBy({ languageId: cmd.id });
    if (inUse)
      throw new ConflictException(
        "Language is still in use by one or more books",
      );

    await Language.remove(language);

    await Promise.all([
      this.cache.del(LANGUAGES_LIST_CACHE_KEY),
      this.cache.del(languageByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(DeleteLanguageResponse, {
      message: "Language deleted successfully",
    });
  }
}
