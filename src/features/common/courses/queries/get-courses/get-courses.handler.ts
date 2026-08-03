import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCoursesQuery } from "@/features/common/courses/queries/get-courses/get-courses.query";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { FindOptionsWhere, ILike } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetCoursesResponse } from "@/features/common/courses/queries/get-courses/get-courses.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";
import { Cache } from "@nestjs/cache-manager";
import {
  COURSES_LIST_CACHE_KEY,
  CachedCoursesList,
} from "@/features/common/courses/course.cache";

@QueryHandler(GetCoursesQuery)
export class GetCoursesHandler implements IQueryHandler<GetCoursesQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetCoursesQuery) {
    const isDefaultQuery =
      !query.payload.search &&
      !query.payload.categoryId &&
      !query.payload.difficultyId &&
      !query.payload.languageId &&
      !query.payload.minRating &&
      !query.payload.page &&
      !query.payload.size;

    if (isDefaultQuery) {
      const cached = await this.cache.get<CachedCoursesList>(
        COURSES_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const where: FindOptionsWhere<Course> = {};
    if (query.payload.search) where.title = ILike(`%${query.payload.search}%`);
    if (query.payload.categoryId) where.categoryId = query.payload.categoryId;
    if (query.payload.difficultyId)
      where.difficultyId = query.payload.difficultyId;
    if (query.payload.languageId) where.languageId = query.payload.languageId;

    const courses = await Course.find({
      where,
      relations: { courseAuthors: true },
    });

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

    const coursesWithStats = courses
      .map((course) => ({
        course,
        ...(statsByCourseId.get(course.id) ?? {
          averageRating: 0,
          ratingsCount: 0,
        }),
        sectionsCount: sectionsCountByCourseId.get(course.id) ?? 0,
        lessonsCount: lessonsCountByCourseId.get(course.id) ?? 0,
      }))
      .filter(
        ({ averageRating }) =>
          !query.payload.minRating || averageRating >= query.payload.minRating,
      );

    const take = query.payload.size ?? 5;
    const currentPage = query.payload.page ?? 1;
    const skip = (currentPage - 1) * take;
    const totalCount = coursesWithStats.length;
    const totalPages = Math.ceil(totalCount / take);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    const data = plainToInstance(
      GetCoursesResponse,
      coursesWithStats
        .slice(skip, skip + take)
        .map(
          ({
            course,
            averageRating,
            ratingsCount,
            sectionsCount,
            lessonsCount,
          }) => ({
            ...course,
            authorIds: course.courseAuthors.map((ca) => ca.authorId),
            averageRating,
            ratingsCount,
            sectionsCount,
            lessonsCount,
          }),
        ),
      { excludeExtraneousValues: true },
    );

    const result = plainToInstance(
      PaginatedResultDto(GetCoursesResponse),
      { totalCount, totalPages, currentPage, hasNext, hasPrevious, data },
      { excludeExtraneousValues: true },
    );

    if (isDefaultQuery) await this.cache.set(COURSES_LIST_CACHE_KEY, result);

    return result;
  }
}
