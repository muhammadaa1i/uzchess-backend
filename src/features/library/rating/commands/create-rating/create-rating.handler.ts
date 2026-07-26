import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateRatingCommand } from "@/features/library/rating/commands/create-rating/create-rating.command";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateRatingResponse } from "@/features/library/rating/commands/create-rating/create-rating.response";
import { Cache } from "@nestjs/cache-manager";
import {
  BOOKS_LIST_CACHE_KEY,
  bookByIdCacheKey,
} from "@/features/library/book/book.cache";

@CommandHandler(CreateRatingCommand)
export class CreateRatingHandler implements ICommandHandler<CreateRatingCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateRatingCommand) {
    const bookExists = await Book.existsBy({ id: cmd.bookId });
    DoesNotExistException.ThrowIf(!bookExists, "Book not found");

    let rating = await Rating.findOneBy({
      bookId: cmd.bookId,
      userId: cmd.userId,
    });
    if (rating) {
      rating.score = cmd.score;
    } else {
      rating = Rating.create({
        bookId: cmd.bookId,
        userId: cmd.userId,
        score: cmd.score,
      });
    }
    await Rating.save(rating);

    const ratingAgg = await Rating.createQueryBuilder("rating")
      .select("AVG(rating.score)", "average")
      .addSelect("COUNT(rating.id)", "count")
      .where("rating.bookId = :bookId", { bookId: cmd.bookId })
      .getRawOne<{ average: string | null; count: string }>();

    await Promise.all([
      this.cache.del(BOOKS_LIST_CACHE_KEY),
      this.cache.del(bookByIdCacheKey(cmd.bookId)),
    ]);

    return plainToInstance(
      CreateRatingResponse,
      {
        bookId: cmd.bookId,
        score: cmd.score,
        averageRating: ratingAgg?.average
          ? Math.round(parseFloat(ratingAgg.average) * 10) / 10
          : 0,
        ratingsCount: ratingAgg ? parseInt(ratingAgg.count, 10) : 0,
      },
      { excludeExtraneousValues: true },
    );
  }
}
