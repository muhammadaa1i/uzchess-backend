import { GetCourseReviewsRequest } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.request";

export class GetCourseReviewsQuery {
  constructor(
    public readonly courseId: number,
    public readonly payload: GetCourseReviewsRequest,
  ) {}
}
