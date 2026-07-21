import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAuthorCommand } from '@/features/book/author/commands/create-author/create-author.command';
import { Author } from '@/features/book/entities/author.entity';
import { plainToInstance } from 'class-transformer';
import { CreateAuthorResponse } from '@/features/book/author/commands/create-author/create-author.response';

@CommandHandler(CreateAuthorCommand)
export class CreateAuthorHandler implements ICommandHandler<CreateAuthorCommand> {
  async execute(cmd: CreateAuthorCommand) {
    const author = Author.create({ fullName: cmd.fullName });
    return plainToInstance(CreateAuthorResponse, await Author.save(author), {
      excludeExtraneousValues: true,
    });
  }
}
