import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteBookCommand} from "@/features/library/book/commands/delete-book/delete-book.command";
import {Book} from "@/features/library/entities/book/book.entity";
import {plainToInstance} from "class-transformer";
import {DeleteBookResponse} from "@/features/library/book/commands/delete-book/delete-book.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {deleteUploadedFile} from "@/core/configs/multer.config";
import {Cache} from "@nestjs/cache-manager";
import {
    BOOKS_LIST_CACHE_KEY,
    bookByIdCacheKey,
} from "@/features/library/book/book.cache";

@CommandHandler(DeleteBookCommand)
export class DeleteBookHandler implements ICommandHandler<DeleteBookCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: DeleteBookCommand) {
        const book = await Book.findOneBy({id: cmd.id});
        DoesNotExistException.ThrowIfNull(book, "Book not found");

        await Book.remove(book);
        await deleteUploadedFile(book.cover).catch(() => {
        });

        await Promise.all([
            this.cache.del(BOOKS_LIST_CACHE_KEY),
            this.cache.del(bookByIdCacheKey(cmd.id)),
        ]);

        return plainToInstance(DeleteBookResponse, {
            message: "Book deleted successfully",
        });
    }
}
