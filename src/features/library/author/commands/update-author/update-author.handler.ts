import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAuthorCommand } from '@/features/library/author/commands/update-author/update-author.command';
import { Author } from '@/features/library/entities/author.entity';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UpdateAuthorResponse } from '@/features/library/author/commands/update-author/update-author.response';

@CommandHandler(UpdateAuthorCommand)
export class UpdateAuthorHandler implements ICommandHandler<UpdateAuthorCommand> {
  async execute(cmd: UpdateAuthorCommand) {
    const author = await Author.findOneBy({ id: cmd.id });

    if (!author) throw new NotFoundException('Author is not found');

    author.fullName = cmd.fullName;

    return plainToInstance(UpdateAuthorResponse, await author.save(), {
      excludeExtraneousValues: true,
    });
  }
}
