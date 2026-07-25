import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAuthorCommand } from '@/features/library/author/commands/delete-author/delete-author.command';
import { Author } from '../../../entities/author/author.entity';
import { plainToInstance } from 'class-transformer';
import { DeleteAuthorResponse } from '@/features/library/author/commands/delete-author/delete-author.response';
import { DoesNotExistException } from '@/core/exceptions/does-not-exist.exception';

@CommandHandler(DeleteAuthorCommand)
export class DeleteAuthorHandler implements ICommandHandler<DeleteAuthorCommand> {
  async execute(cmd: DeleteAuthorCommand) {
    const author = await Author.findOneBy({ id: cmd.id });

    DoesNotExistException.ThrowIfNull(author, 'Author is not found');
    
    await Author.remove(author);

    return plainToInstance(DeleteAuthorResponse, {
      message: 'Author deleted successfully',
    });
  }
}
