import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {RatingController} from '@/features/library/rating/rating.controller';
import {RateBookHandler} from '@/features/library/rating/commands/rate-book/rate-book.handler';
import {DeleteRatingHandler} from '@/features/library/rating/commands/delete-rating/delete-rating.handler';

@Module({
    imports: [CqrsModule],
    controllers: [RatingController],
    providers: [
        RateBookHandler,
        DeleteRatingHandler,
    ],
})
export class RatingModule {
}
