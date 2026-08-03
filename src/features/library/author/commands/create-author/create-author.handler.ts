import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateAuthorCommand } from "@/features/library/author/commands/create-author/create-author.command";
import { Author } from "../../../entities/author/author.entity";
import { plainToInstance } from "class-transformer";
import { CreateAuthorResponse } from "@/features/library/author/commands/create-author/create-author.response";
import { Cache } from "@nestjs/cache-manager";
import { AUTHORS_LIST_CACHE_KEY } from "@/features/library/author/author.cache";

@CommandHandler(CreateAuthorCommand)
export class CreateAuthorHandler implements ICommandHandler<CreateAuthorCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateAuthorCommand) {
    const author = Author.create({ fullName: cmd.payload.fullName });
    const saved = await Author.save(author);

    await this.cache.del(AUTHORS_LIST_CACHE_KEY);

    return plainToInstance(CreateAuthorResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
