import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetBooksQuery} from "@/features/library/book/queries/get-books/get-books.query";
import {Book} from "@/features/library/entities/book/book.entity";
import {Rating} from "@/features/library/entities/rating/rating.entity";
import {FindOptionsWhere, ILike} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetBooksResponse} from "@/features/library/book/queries/get-books/get-books.response";

@QueryHandler(GetBooksQuery)
export class GetBooksHandler implements IQueryHandler<GetBooksQuery> {
    async execute(query: GetBooksQuery) {
        const where: FindOptionsWhere<Book> = {}
        if (query.search) where.title = ILike(`%${query.search}%`)
        if (query.categoryId) where.categoryId = query.categoryId
        if (query.difficultyId) where.difficultyId = query.difficultyId
        if (query.languageId) where.languageId = query.languageId

        const books = await Book.find({where, relations: {bookAuthors: true}})

        const bookIds = books.map((book) => book.id)
        const ratingRows = bookIds.length
            ? await Rating.createQueryBuilder('rating')
                .select('rating.bookId', 'bookId')
                .addSelect('AVG(rating.score)', 'average')
                .addSelect('COUNT(rating.id)', 'count')
                .where('rating.bookId IN (:...bookIds)', {bookIds})
                .groupBy('rating.bookId')
                .getRawMany<{ bookId: number; average: string; count: string }>()
            : []

        const statsByBookId = new Map(ratingRows.map((row) => [row.bookId, {
            averageRating: Math.round(parseFloat(row.average) * 10) / 10,
            ratingsCount: parseInt(row.count, 10),
        }]))

        const booksWithStats = books
            .map((book) => ({book, ...(statsByBookId.get(book.id) ?? {averageRating: 0, ratingsCount: 0})}))
            .filter(({averageRating}) => !query.minRating || averageRating >= query.minRating)

        return plainToInstance(GetBooksResponse, booksWithStats.map(({book, averageRating, ratingsCount}) => ({
            ...book,
            authorIds: book.bookAuthors.map((ba) => ba.authorId),
            averageRating,
            ratingsCount,
        })), {excludeExtraneousValues: true})
    }
}
