import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetBooksQuery} from "@/features/library/book/queries/get-books/get-books.query";
import {Book} from "@/features/library/entities/book/book.entity";
import {Rating} from "@/features/library/entities/rating/rating.entity";
import {FindOptionsWhere, ILike} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetBooksResponse} from "@/features/library/book/queries/get-books/get-books.response";
import {PaginatedResultDto} from "../../../../../core/dtos/paginated-result.dto";
import {Cache} from "@nestjs/cache-manager";
import {
    BOOKS_LIST_CACHE_KEY,
    CachedBooksList,
} from "@/features/library/book/book.cache";

@QueryHandler(GetBooksQuery)
export class GetBooksHandler implements IQueryHandler<GetBooksQuery> {
    constructor(private readonly cache: Cache) {
    }

    async execute(query: GetBooksQuery) {
        const isDefaultQuery =
            !query.search &&
            !query.categoryId &&
            !query.difficultyId &&
            !query.languageId &&
            !query.minRating &&
            !query.page &&
            !query.size;

        if (isDefaultQuery) {
            const cached =
                await this.cache.get<CachedBooksList>(BOOKS_LIST_CACHE_KEY);
            if (cached) return cached;
        }

        const where: FindOptionsWhere<Book> = {};
        if (query.search) where.title = ILike(`%${query.search}%`);
        if (query.categoryId) where.categoryId = query.categoryId;
        if (query.difficultyId) where.difficultyId = query.difficultyId;
        if (query.languageId) where.languageId = query.languageId;

        const books = await Book.find({where, relations: {bookAuthors: true}});

        const bookIds = books.map((book) => book.id);
        const ratingRows = bookIds.length
            ? await Rating.createQueryBuilder("rating")
                .select("rating.bookId", "bookId")
                .addSelect("AVG(rating.score)", "average")
                .addSelect("COUNT(rating.id)", "count")
                .where("rating.bookId IN (:...bookIds)", {bookIds})
                .groupBy("rating.bookId")
                .getRawMany<{ bookId: number; average: string; count: string }>()
            : [];

        const statsByBookId = new Map(
            ratingRows.map((row) => [
                row.bookId,
                {
                    averageRating: Math.round(parseFloat(row.average) * 10) / 10,
                    ratingsCount: parseInt(row.count, 10),
                },
            ]),
        );

        const booksWithStats = books
            .map((book) => ({
                book,
                ...(statsByBookId.get(book.id) ?? {
                    averageRating: 0,
                    ratingsCount: 0,
                }),
            }))
            .filter(
                ({averageRating}) =>
                    !query.minRating || averageRating >= query.minRating,
            );

        const take = query.size ?? 5;
        const currentPage = query.page ?? 1;
        const skip = (currentPage - 1) * take;
        const totalCount = booksWithStats.length;
        const totalPages = Math.ceil(totalCount / take);
        const hasNext = currentPage < totalPages;
        const hasPrevious = currentPage > 1;

        const data = plainToInstance(
            GetBooksResponse,
            booksWithStats
                .slice(skip, skip + take)
                .map(({book, averageRating, ratingsCount}) => ({
                    ...book,
                    authorIds: book.bookAuthors.map((ba) => ba.authorId),
                    averageRating,
                    ratingsCount,
                })),
            {excludeExtraneousValues: true},
        );

        const result = plainToInstance(
            PaginatedResultDto(GetBooksResponse),
            {totalCount, totalPages, currentPage, hasNext, hasPrevious, data},
            {excludeExtraneousValues: true},
        );

        if (isDefaultQuery) await this.cache.set(BOOKS_LIST_CACHE_KEY, result);

        return result;
    }
}
