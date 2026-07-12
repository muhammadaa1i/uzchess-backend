import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAuthorCommand } from '@/features/library/author/commands/create-author/create-author.command';
import { Author } from '@/features/library/entities/author.entity';
import { plainToInstance } from 'class-transformer';
import { CreateAuthorResponse } from '@/features/library/author/commands/create-author/create-author.response';

@CommandHandler(CreateAuthorCommand)
export class CreateAuthorHandler implements ICommandHandler<CreateAuthorCommand> {
  async execute(cmd: CreateAuthorCommand) {
    const author = Author.create({ fullName: cmd.fullName });
    return plainToInstance(CreateAuthorResponse, await Author.save(author), {
      excludeExtraneousValues: true,
    });
  }
}
