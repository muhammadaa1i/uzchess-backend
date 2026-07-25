import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteBookCommand} from "@/features/library/book/commands/delete-book/delete-book.command";
import {Book} from "@/features/library/entities/book/book.entity";
import {plainToInstance} from "class-transformer";
import {DeleteBookResponse} from "@/features/library/book/commands/delete-book/delete-book.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {unlink} from "node:fs/promises";

@CommandHandler(DeleteBookCommand)
export class DeleteBookHandler implements ICommandHandler<DeleteBookCommand> {
    async execute(cmd: DeleteBookCommand) {
        const book = await Book.findOneBy({id: cmd.id})
        DoesNotExistException.ThrowIfNull(book, "Book not found")

        await Book.remove(book)
        await unlink(book.cover).catch(() => {})

        return plainToInstance(DeleteBookResponse, {
            message: 'Book deleted successfully'
        })
    }
}
