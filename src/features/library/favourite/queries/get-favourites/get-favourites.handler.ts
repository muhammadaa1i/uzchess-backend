import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetFavouritesQuery } from "@/features/library/favourite/queries/get-favourites/get-favourites.query";
import { Favourite } from "@/features/library/entities/favourite/favourite.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { In } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetFavouritesResponse } from "@/features/library/favourite/queries/get-favourites/get-favourites.response";

@QueryHandler(GetFavouritesQuery)
export class GetFavouritesHandler implements IQueryHandler<GetFavouritesQuery> {
  async execute(query: GetFavouritesQuery) {
    const favourites = await Favourite.findBy({ userId: query.userId });
    const bookIds = favourites.map((favourite) => favourite.bookId);

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

    return plainToInstance(
      GetFavouritesResponse,
      books.map((book) => ({
        ...book,
        authorIds: book.bookAuthors.map((ba) => ba.authorId),
        ...(statsByBookId.get(book.id) ?? {
          averageRating: 0,
          ratingsCount: 0,
        }),
      })),
      { excludeExtraneousValues: true },
    );
  }
}
