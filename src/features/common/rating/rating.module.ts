import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { RatingController } from "@/features/common/rating/rating.controller";
import { CreateRatingHandler } from "@/features/common/rating/commands/create-rating/create-rating.handler";
import { DeleteRatingHandler } from "@/features/common/rating/commands/delete-rating/delete-rating.handler";
import { GetCourseReviewsHandler } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.handler";

@Module({
  imports: [CqrsModule],
  controllers: [RatingController],
  providers: [CreateRatingHandler, DeleteRatingHandler, GetCourseReviewsHandler],
})
export class RatingModule {}
