import { CreateCourseRatingRequest } from "@/features/common/rating/commands/create-rating/create-rating.request";

export class CreateRatingCommand {
  constructor(
    public readonly courseId: number,
    public readonly userId: number,
    public readonly payload: CreateCourseRatingRequest,
  ) {}
}
