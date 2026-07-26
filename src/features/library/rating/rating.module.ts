import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { RatingController } from "@/features/library/rating/rating.controller";
import { CreateRatingHandler } from "@/features/library/rating/commands/create-rating/create-rating.handler";
import { DeleteRatingHandler } from "@/features/library/rating/commands/delete-rating/delete-rating.handler";

@Module({
  imports: [CqrsModule],
  controllers: [RatingController],
  providers: [CreateRatingHandler, DeleteRatingHandler],
})
export class RatingModule {}
