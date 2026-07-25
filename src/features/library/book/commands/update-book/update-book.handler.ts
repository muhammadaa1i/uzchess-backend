import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateBookCommand} from "@/features/library/book/commands/update-book/update-book.command";
import {Book} from "@/features/library/entities/book/book.entity";
import {BookAuthor} from "@/features/library/entities/book/book-author.entity";
import {Category} from "@/features/library/entities/category/category.entity";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {Language} from "@/features/library/entities/languages/language.entity";
import {Author} from "@/features/library/entities/author/author.entity";
import {In} from "typeorm";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {UpdateBookResponse} from "@/features/library/book/commands/update-book/update-book.response";
import {unlink} from "node:fs/promises";

@CommandHandler(UpdateBookCommand)
export class UpdateBookHandler implements ICommandHandler<UpdateBookCommand> {
    async execute(cmd: UpdateBookCommand) {
        const book = await Book.findOneBy({id: cmd.id})
        DoesNotExistException.ThrowIfNull(book, "Book not found")

        if (cmd.categoryId !== undefined) {
            const categoryExists = await Category.existsBy({id: cmd.categoryId})
            DoesNotExistException.ThrowIf(!categoryExists, "Category not found")
            book.categoryId = cmd.categoryId
        }

        if (cmd.difficultyId !== undefined) {
            const difficultyExists = await Difficulty.existsBy({id: cmd.difficultyId})
            DoesNotExistException.ThrowIf(!difficultyExists, "Difficulty not found")
            book.difficultyId = cmd.difficultyId
        }

        if (cmd.languageId !== undefined) {
            const languageExists = await Language.existsBy({id: cmd.languageId})
            DoesNotExistException.ThrowIf(!languageExists, "Language not found")
            book.languageId = cmd.languageId
        }

        if (cmd.title !== undefined) book.title = cmd.title
        if (cmd.price !== undefined) book.price = cmd.price
        if (cmd.discountPrice !== undefined) book.discountPrice = cmd.discountPrice

        if (cmd.coverPath) {
            const oldCover = book.cover
            book.cover = cmd.coverPath
            await unlink(oldCover).catch(() => {
            })
        }

        await book.save()

        let authorIds = cmd.authorIds
        if (authorIds) {
            const authorsCount = await Author.countBy({id: In(authorIds)})
            DoesNotExistException.ThrowIf(authorsCount !== authorIds.length, "One or more authors not found")

            await BookAuthor.delete({bookId: book.id})
            const bookAuthors = authorIds.map((authorId) => BookAuthor.create({bookId: book.id, authorId}))
            await BookAuthor.save(bookAuthors)
        } else {
            const existing = await BookAuthor.findBy({bookId: book.id})
            authorIds = existing.map((ba) => ba.authorId)
        }

        return plainToInstance(UpdateBookResponse, {
            ...book,
            authorIds,
        }, {excludeExtraneousValues: true})
    }
}
