import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetBooksByIdQuery} from "@/features/library/book/queries/get-books-by-id/get-books-by-id.query";
import {Book} from "@/features/library/entities/book/book.entity";
import {Rating} from "@/features/library/entities/rating/rating.entity";
import {plainToInstance} from "class-transformer";
import {GetBooksByIdResponse} from "@/features/library/book/queries/get-books-by-id/get-books-by-id.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {Cache} from "@nestjs/cache-manager";
import {bookByIdCacheKey} from "@/features/library/book/book.cache";

@QueryHandler(GetBooksByIdQuery)
export class GetBooksByIdHandler implements IQueryHandler<GetBooksByIdQuery> {
    constructor(private readonly cache: Cache) {
    }

    async execute(query: GetBooksByIdQuery) {
        const cacheKey = bookByIdCacheKey(query.id);
        const cached = await this.cache.get<GetBooksByIdResponse>(cacheKey);
        if (cached) return cached;

        const book = await Book.findOne({
            where: {id: query.id},
            relations: {bookAuthors: true},
        });
        DoesNotExistException.ThrowIfNull(book, "Book not found");

        const ratingAgg = await Rating.createQueryBuilder("rating")
            .select("AVG(rating.score)", "average")
            .addSelect("COUNT(rating.id)", "count")
            .where("rating.bookId = :bookId", {bookId: book.id})
            .getRawOne<{ average: string | null; count: string }>();

        const result = plainToInstance(
            GetBooksByIdResponse,
            {
                ...book,
                authorIds: book.bookAuthors.map((ba) => ba.authorId),
                averageRating: ratingAgg?.average
                    ? Math.round(parseFloat(ratingAgg.average) * 10) / 10
                    : 0,
                ratingsCount: ratingAgg ? parseInt(ratingAgg.count, 10) : 0,
            },
            {excludeExtraneousValues: true},
        );

        await this.cache.set(cacheKey, result);

        return result;
    }
}
