import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBookCommand } from "@/features/library/book/commands/update-book/update-book.command";
import { Book } from "@/features/library/entities/book/book.entity";
import { BookAuthor } from "@/features/library/entities/book/book-author.entity";
import { Category } from "@/features/library/entities/category/category.entity";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Language } from "@/features/library/entities/languages/language.entity";
import { Author } from "@/features/library/entities/author/author.entity";
import { In } from "typeorm";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateBookResponse } from "@/features/library/book/commands/update-book/update-book.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  BOOKS_LIST_CACHE_KEY,
  bookByIdCacheKey,
} from "@/features/library/book/book.cache";

@CommandHandler(UpdateBookCommand)
export class UpdateBookHandler implements ICommandHandler<UpdateBookCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateBookCommand) {
    const book = await Book.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(book, "Book not found");

    // Validate all foreign keys up front so a bad reference never leaves
    // some fields persisted while the request as a whole fails (see
    // create-book.handler.ts for the same validate-then-mutate ordering).
    if (cmd.categoryId !== undefined) {
      const categoryExists = await Category.existsBy({ id: cmd.categoryId });
      DoesNotExistException.ThrowIf(!categoryExists, "Category not found");
    }

    if (cmd.difficultyId !== undefined) {
      const difficultyExists = await Difficulty.existsBy({
        id: cmd.difficultyId,
      });
      DoesNotExistException.ThrowIf(!difficultyExists, "Difficulty not found");
    }

    if (cmd.languageId !== undefined) {
      const languageExists = await Language.existsBy({ id: cmd.languageId });
      DoesNotExistException.ThrowIf(!languageExists, "Language not found");
    }

    if (cmd.authorIds) {
      const authorsCount = await Author.countBy({ id: In(cmd.authorIds) });
      DoesNotExistException.ThrowIf(
        authorsCount !== cmd.authorIds.length,
        "One or more authors not found",
      );
    }

    if (cmd.categoryId !== undefined) book.categoryId = cmd.categoryId;
    if (cmd.difficultyId !== undefined) book.difficultyId = cmd.difficultyId;
    if (cmd.languageId !== undefined) book.languageId = cmd.languageId;
    if (cmd.title !== undefined) book.title = cmd.title;
    if (cmd.price !== undefined) book.price = cmd.price;
    if (cmd.discountPrice !== undefined) book.discountPrice = cmd.discountPrice;
    if (cmd.description !== undefined) book.description = cmd.description;
    if (cmd.pageCount !== undefined) book.pageCount = cmd.pageCount;
    if (cmd.publishedYear !== undefined) book.publishedYear = cmd.publishedYear;

    if (cmd.coverPath) {
      const oldCover = book.cover;
      book.cover = cmd.coverPath;
      await deleteUploadedFile(oldCover).catch(() => {});
    }

    await book.save();

    let authorIds = cmd.authorIds;
    if (authorIds) {
      await BookAuthor.delete({ bookId: book.id });
      const bookAuthors = authorIds.map((authorId) =>
        BookAuthor.create({ bookId: book.id, authorId }),
      );
      await BookAuthor.save(bookAuthors);
    } else {
      const existing = await BookAuthor.findBy({ bookId: book.id });
      authorIds = existing.map((ba) => ba.authorId);
    }

    await Promise.all([
      this.cache.del(BOOKS_LIST_CACHE_KEY),
      this.cache.del(bookByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(
      UpdateBookResponse,
      {
        ...book,
        authorIds,
      },
      { excludeExtraneousValues: true },
    );
  }
}
