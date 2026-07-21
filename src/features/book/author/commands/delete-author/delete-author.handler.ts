import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAuthorCommand } from '@/features/book/author/commands/delete-author/delete-author.command';
import { Author } from '@/features/book/entities/author.entity';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DeleteAuthorResponse } from '@/features/book/author/commands/delete-author/delete-author.response';

@CommandHandler(DeleteAuthorCommand)
export class DeleteAuthorHandler implements ICommandHandler<DeleteAuthorCommand> {
  async execute(cmd: DeleteAuthorCommand) {
    const author = await Author.findOneBy({ id: cmd.id });

    if (!author) throw new NotFoundException('Author is not found');
    
    await Author.remove(author);

    return plainToInstance(DeleteAuthorResponse, {
      message: 'Author deleted successfully',
    });
  }
}
