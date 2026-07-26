import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateAuthorCommand } from "@/features/library/author/commands/update-author/update-author.command";
import { Author } from "../../../entities/author/author.entity";
import { plainToInstance } from "class-transformer";
import { UpdateAuthorResponse } from "@/features/library/author/commands/update-author/update-author.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import {
  AUTHORS_LIST_CACHE_KEY,
  authorByIdCacheKey,
} from "@/features/library/author/author.cache";

@CommandHandler(UpdateAuthorCommand)
export class UpdateAuthorHandler implements ICommandHandler<UpdateAuthorCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateAuthorCommand) {
    const author = await Author.findOneBy({ id: cmd.id });

    DoesNotExistException.ThrowIfNull(author, "Author is not found");

    author.fullName = cmd.fullName;
    const saved = await author.save();

    await Promise.all([
      this.cache.del(AUTHORS_LIST_CACHE_KEY),
      this.cache.del(authorByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(UpdateAuthorResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
