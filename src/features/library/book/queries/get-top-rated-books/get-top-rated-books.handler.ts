import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTopRatedBooksQuery } from "@/features/library/book/queries/get-top-rated-books/get-top-rated-books.query";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { OrderStatus } from "@/core/enums/order-status.enum";
import { plainToInstance } from "class-transformer";
import { GetTopRatedBooksResponse } from "@/features/library/book/queries/get-top-rated-books/get-top-rated-books.response";
import { Cache } from "@nestjs/cache-manager";
import { TOP_RATED_BOOKS_CACHE_KEY } from "@/features/library/book/book.cache";

const TOP_RATED_BOOKS_LIMIT = 4;

@QueryHandler(GetTopRatedBooksQuery)
export class GetTopRatedBooksHandler implements IQueryHandler<GetTopRatedBooksQuery> {
  constructor(private readonly cache: Cache) {}

  async execute() {
    const cached = await this.cache.get<GetTopRatedBooksResponse[]>(
      TOP_RATED_BOOKS_CACHE_KEY,
    );
    if (cached) return cached;

    const books = await Book.find({ relations: { bookAuthors: true } });

    const bookIds = books.map((book) => book.id);
    const ratingRows = bookIds.length
      ? await Rating.createQueryBuilder("rating")
          .select("rating.bookId", "bookId")
          .addSelect("AVG(rating.score)", "average")
          .addSelect("COUNT(rating.id)", "count")
          .where("rating.bookId IN (:...bookIds)", { bookIds })
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

    const purchaseRows = bookIds.length
      ? await OrderItem.createQueryBuilder("item")
          .innerJoin("item.order", "order")
          .select("item.bookId", "bookId")
          .addSelect("SUM(item.quantity)", "quantity")
          .where("item.bookId IN (:...bookIds)", { bookIds })
          .andWhere("order.status != :cancelled", {
            cancelled: OrderStatus.Cancelled,
          })
          .groupBy("item.bookId")
          .getRawMany<{ bookId: number; quantity: string }>()
      : [];

    const purchasesCountByBookId = new Map(
      purchaseRows.map((row) => [row.bookId, parseInt(row.quantity, 10)]),
    );

    const booksWithStats = books.map((book) => ({
      book,
      ...(statsByBookId.get(book.id) ?? {
        averageRating: 0,
        ratingsCount: 0,
      }),
      purchasesCount: purchasesCountByBookId.get(book.id) ?? 0,
    }));

    booksWithStats.sort((a, b) => b.averageRating - a.averageRating);

    const result = plainToInstance(
      GetTopRatedBooksResponse,
      booksWithStats
        .slice(0, TOP_RATED_BOOKS_LIMIT)
        .map(({ book, averageRating, ratingsCount, purchasesCount }) => ({
          ...book,
          authorIds: book.bookAuthors.map((ba) => ba.authorId),
          averageRating,
          ratingsCount,
          purchasesCount,
        })),
      { excludeExtraneousValues: true },
    );

    await this.cache.set(TOP_RATED_BOOKS_CACHE_KEY, result);

    return result;
  }
}
