import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCartItemsQuery } from "@/features/library/cart/queries/get-cart-items/get-cart-items.query";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { In } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetCartItemsResponse } from "@/features/library/cart/queries/get-cart-items/get-cart-items.response";

@QueryHandler(GetCartItemsQuery)
export class GetCartItemsHandler implements IQueryHandler<GetCartItemsQuery> {
  async execute(query: GetCartItemsQuery) {
    const cartItems = await CartItem.findBy({ userId: query.userId });
    const bookIds = cartItems.map((item) => item.bookId);

    const books = bookIds.length
      ? await Book.find({
          where: { id: In(bookIds) },
          relations: { bookAuthors: true },
        })
      : [];

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

    const quantityByBookId = new Map(
      cartItems.map((item) => [item.bookId, item.quantity]),
    );

    return plainToInstance(
      GetCartItemsResponse,
      books.map((book) => ({
        ...book,
        authorIds: book.bookAuthors.map((ba) => ba.authorId),
        ...(statsByBookId.get(book.id) ?? {
          averageRating: 0,
          ratingsCount: 0,
        }),
        quantity: quantityByBookId.get(book.id) ?? 1,
      })),
      { excludeExtraneousValues: true },
    );
  }
}
