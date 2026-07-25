import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {RateBookCommand} from "@/features/library/rating/commands/rate-book/rate-book.command";
import {Book} from "@/features/library/entities/book/book.entity";
import {Rating} from "@/features/library/entities/rating/rating.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {RateBookResponse} from "@/features/library/rating/commands/rate-book/rate-book.response";

@CommandHandler(RateBookCommand)
export class RateBookHandler implements ICommandHandler<RateBookCommand> {
    async execute(cmd: RateBookCommand) {
        const bookExists = await Book.existsBy({id: cmd.bookId})
        DoesNotExistException.ThrowIf(!bookExists, "Book not found")

        let rating = await Rating.findOneBy({bookId: cmd.bookId, userId: cmd.userId})
        if (rating) {
            rating.score = cmd.score
        } else {
            rating = Rating.create({bookId: cmd.bookId, userId: cmd.userId, score: cmd.score})
        }
        await Rating.save(rating)

        const ratingAgg = await Rating.createQueryBuilder('rating')
            .select('AVG(rating.score)', 'average')
            .addSelect('COUNT(rating.id)', 'count')
            .where('rating.bookId = :bookId', {bookId: cmd.bookId})
            .getRawOne<{ average: string | null; count: string }>()

        return plainToInstance(RateBookResponse, {
            bookId: cmd.bookId,
            score: cmd.score,
            averageRating: ratingAgg?.average ? Math.round(parseFloat(ratingAgg.average) * 10) / 10 : 0,
            ratingsCount: ratingAgg ? parseInt(ratingAgg.count, 10) : 0,
        }, {excludeExtraneousValues: true})
    }
}
