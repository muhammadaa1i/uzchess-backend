import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetTopRatedCoursesQuery } from "@/features/common/courses/queries/get-top-rated-courses/get-top-rated-courses.query";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { PurchaseStatus } from "@/core/enums/purchase-status.enum";
import { plainToInstance } from "class-transformer";
import { GetTopRatedCoursesResponse } from "@/features/common/courses/queries/get-top-rated-courses/get-top-rated-courses.response";
import { Cache } from "@nestjs/cache-manager";
import { TOP_RATED_COURSES_CACHE_KEY } from "@/features/common/courses/course.cache";

const TOP_RATED_COURSES_LIMIT = 4;

@QueryHandler(GetTopRatedCoursesQuery)
export class GetTopRatedCoursesHandler implements IQueryHandler<GetTopRatedCoursesQuery> {
  constructor(private readonly cache: Cache) {}

  async execute() {
    const cached = await this.cache.get<GetTopRatedCoursesResponse[]>(
      TOP_RATED_COURSES_CACHE_KEY,
    );
    if (cached) return cached;

    const courses = await Course.find({ relations: { courseAuthors: true } });

    const courseIds = courses.map((course) => course.id);
    const ratingRows = courseIds.length
      ? await CourseRating.createQueryBuilder("rating")
          .select("rating.courseId", "courseId")
          .addSelect("AVG(rating.score)", "average")
          .addSelect("COUNT(rating.id)", "count")
          .where("rating.courseId IN (:...courseIds)", { courseIds })
          .groupBy("rating.courseId")
          .getRawMany<{ courseId: number; average: string; count: string }>()
      : [];

    const statsByCourseId = new Map(
      ratingRows.map((row) => [
        row.courseId,
        {
          averageRating: Math.round(parseFloat(row.average) * 10) / 10,
          ratingsCount: parseInt(row.count, 10),
        },
      ]),
    );

    const sectionsRows = courseIds.length
      ? await CourseSection.createQueryBuilder("section")
          .select("section.courseId", "courseId")
          .addSelect("COUNT(section.id)", "count")
          .where("section.courseId IN (:...courseIds)", { courseIds })
          .groupBy("section.courseId")
          .getRawMany<{ courseId: number; count: string }>()
      : [];
    const sectionsCountByCourseId = new Map(
      sectionsRows.map((row) => [row.courseId, parseInt(row.count, 10)]),
    );

    const lessonsRows = courseIds.length
      ? await CourseLesson.createQueryBuilder("lesson")
          .innerJoin("lesson.section", "section")
          .select("section.courseId", "courseId")
          .addSelect("COUNT(lesson.id)", "count")
          .where("section.courseId IN (:...courseIds)", { courseIds })
          .groupBy("section.courseId")
          .getRawMany<{ courseId: number; count: string }>()
      : [];
    const lessonsCountByCourseId = new Map(
      lessonsRows.map((row) => [row.courseId, parseInt(row.count, 10)]),
    );

    const purchaseRows = courseIds.length
      ? await CoursePurchase.createQueryBuilder("purchase")
          .select("purchase.courseId", "courseId")
          .addSelect("COUNT(purchase.id)", "count")
          .where("purchase.courseId IN (:...courseIds)", { courseIds })
          .andWhere("purchase.status = :success", {
            success: PurchaseStatus.Success,
          })
          .groupBy("purchase.courseId")
          .getRawMany<{ courseId: number; count: string }>()
      : [];
    const purchasesCountByCourseId = new Map(
      purchaseRows.map((row) => [row.courseId, parseInt(row.count, 10)]),
    );

    const coursesWithStats = courses.map((course) => ({
      course,
      ...(statsByCourseId.get(course.id) ?? {
        averageRating: 0,
        ratingsCount: 0,
      }),
      sectionsCount: sectionsCountByCourseId.get(course.id) ?? 0,
      lessonsCount: lessonsCountByCourseId.get(course.id) ?? 0,
      purchasesCount: purchasesCountByCourseId.get(course.id) ?? 0,
    }));

    coursesWithStats.sort((a, b) => b.averageRating - a.averageRating);

    const result = plainToInstance(
      GetTopRatedCoursesResponse,
      coursesWithStats
        .slice(0, TOP_RATED_COURSES_LIMIT)
        .map(
          ({
            course,
            averageRating,
            ratingsCount,
            sectionsCount,
            lessonsCount,
            purchasesCount,
          }) => ({
            ...course,
            authorIds: course.courseAuthors.map((ca) => ca.authorId),
            averageRating,
            ratingsCount,
            sectionsCount,
            lessonsCount,
            purchasesCount,
          }),
        ),
      { excludeExtraneousValues: true },
    );

    await this.cache.set(TOP_RATED_COURSES_CACHE_KEY, result);

    return result;
  }
}
