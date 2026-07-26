import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {BookController} from "@/features/library/book/book.controller";
import {CreateBookHandler} from "@/features/library/book/commands/create-book/create-book.handler";
import {UpdateBookHandler} from "@/features/library/book/commands/update-book/update-book.handler";
import {DeleteBookHandler} from "@/features/library/book/commands/delete-book/delete-book.handler";
import {GetBooksHandler} from "@/features/library/book/queries/get-books/get-books.handler";
import {GetBooksByIdHandler} from "@/features/library/book/queries/get-books-by-id/get-books-by-id.handler";

@Module({
    imports: [CqrsModule],
    controllers: [BookController],
    providers: [
        GetBooksHandler,
        GetBooksByIdHandler,
        CreateBookHandler,
        UpdateBookHandler,
        DeleteBookHandler,
    ],
})
export class BookModule {
}
