import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCourseReviewsQuery } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.query";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { plainToInstance } from "class-transformer";
import { GetCourseReviewsResponse } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";

@QueryHandler(GetCourseReviewsQuery)
export class GetCourseReviewsHandler implements IQueryHandler<GetCourseReviewsQuery> {
  async execute(query: GetCourseReviewsQuery) {
    const take = query.payload.size ?? 5;
    const currentPage = query.payload.page ?? 1;
    const skip = (currentPage - 1) * take;

    const [reviews, totalCount] = await CourseRating.findAndCount({
      where: { courseId: query.courseId },
      relations: { user: true },
      order: { createdAt: "DESC" },
      skip,
      take,
    });

    const totalPages = Math.ceil(totalCount / take);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    const data = plainToInstance(
      GetCourseReviewsResponse,
      reviews.map((review) => ({
        id: review.id,
        userId: review.userId,
        userFullName: `${review.user.firstName} ${review.user.lastName}`,
        score: review.score,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      { excludeExtraneousValues: true },
    );

    return plainToInstance(
      PaginatedResultDto(GetCourseReviewsResponse),
      { totalCount, totalPages, currentPage, hasNext, hasPrevious, data },
      { excludeExtraneousValues: true },
    );
  }
}
