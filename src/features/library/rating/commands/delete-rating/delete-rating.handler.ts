import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteRatingCommand } from "@/features/library/rating/commands/delete-rating/delete-rating.command";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { plainToInstance } from "class-transformer";
import { DeleteRatingResponse } from "@/features/library/rating/commands/delete-rating/delete-rating.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import {
  BOOKS_LIST_CACHE_KEY,
  bookByIdCacheKey,
} from "@/features/library/book/book.cache";

@CommandHandler(DeleteRatingCommand)
export class DeleteRatingHandler implements ICommandHandler<DeleteRatingCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteRatingCommand) {
    const rating = await Rating.findOneBy({
      bookId: cmd.bookId,
      userId: cmd.userId,
    });
    DoesNotExistException.ThrowIfNull(rating, "Rating not found");

    await Rating.remove(rating);

    await Promise.all([
      this.cache.del(BOOKS_LIST_CACHE_KEY),
      this.cache.del(bookByIdCacheKey(cmd.bookId)),
    ]);

    return plainToInstance(DeleteRatingResponse, {
      message: "Rating deleted successfully",
    });
  }
}
