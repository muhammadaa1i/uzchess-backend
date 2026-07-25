import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateAuthorCommand } from '@/features/library/author/commands/update-author/update-author.command';
import { Author } from '../../../entities/author/author.entity';
import { plainToInstance } from 'class-transformer';
import { UpdateAuthorResponse } from '@/features/library/author/commands/update-author/update-author.response';
import { DoesNotExistException } from '@/core/exceptions/does-not-exist.exception';

@CommandHandler(UpdateAuthorCommand)
export class UpdateAuthorHandler implements ICommandHandler<UpdateAuthorCommand> {
  async execute(cmd: UpdateAuthorCommand) {
    const author = await Author.findOneBy({ id: cmd.id });

    DoesNotExistException.ThrowIfNull(author, 'Author is not found');

    author.fullName = cmd.fullName;

    return plainToInstance(UpdateAuthorResponse, await author.save(), {
      excludeExtraneousValues: true,
    });
  }
}
