import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateBookCommand} from "@/features/library/book/commands/create-book/create-book.command";
import {Book} from "@/features/library/entities/book/book.entity";
import {BookAuthor} from "@/features/library/entities/book/book-author.entity";
import {Category} from "@/features/library/entities/category/category.entity";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {Language} from "@/features/library/entities/languages/language.entity";
import {Author} from "@/features/library/entities/author/author.entity";
import {In} from "typeorm";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreateBookResponse} from "@/features/library/book/commands/create-book/create-book.response";
import {Cache} from "@nestjs/cache-manager";
import {BOOKS_LIST_CACHE_KEY} from "@/features/library/book/book.cache";

@CommandHandler(CreateBookCommand)
export class CreateBookHandler implements ICommandHandler<CreateBookCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: CreateBookCommand) {
        const categoryExists = await Category.existsBy({id: cmd.categoryId});
        DoesNotExistException.ThrowIf(!categoryExists, "Category not found");

        const difficultyExists = await Difficulty.existsBy({
            id: cmd.difficultyId,
        });
        DoesNotExistException.ThrowIf(!difficultyExists, "Difficulty not found");

        const languageExists = await Language.existsBy({id: cmd.languageId});
        DoesNotExistException.ThrowIf(!languageExists, "Language not found");

        const authorsCount = await Author.countBy({id: In(cmd.authorIds)});
        DoesNotExistException.ThrowIf(
            authorsCount !== cmd.authorIds.length,
            "One or more authors not found",
        );

        const book = Book.create({
            title: cmd.title,
            price: cmd.price,
            discountPrice: cmd.discountPrice ?? null,
            cover: cmd.coverPath,
            description: cmd.description,
            pageCount: cmd.pageCount,
            publishedYear: cmd.publishedYear,
            categoryId: cmd.categoryId,
            difficultyId: cmd.difficultyId,
            languageId: cmd.languageId,
        });
        await Book.save(book);

        const bookAuthors = cmd.authorIds.map((authorId) =>
            BookAuthor.create({bookId: book.id, authorId}),
        );
        await BookAuthor.save(bookAuthors);

        await this.cache.del(BOOKS_LIST_CACHE_KEY);

        return plainToInstance(
            CreateBookResponse,
            {
                ...book,
                authorIds: cmd.authorIds,
            },
            {excludeExtraneousValues: true},
        );
    }
}
