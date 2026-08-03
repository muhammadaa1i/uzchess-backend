import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetLessonsQuery } from "@/features/common/lesson/queries/get-lessons/get-lessons.query";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { plainToInstance } from "class-transformer";
import { GetLessonsResponse } from "@/features/common/lesson/queries/get-lessons/get-lessons.response";
import { Cache } from "@nestjs/cache-manager";
import { lessonsListCacheKey } from "@/features/common/lesson/lesson.cache";

@QueryHandler(GetLessonsQuery)
export class GetLessonsHandler implements IQueryHandler<GetLessonsQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetLessonsQuery) {
    const cacheKey = lessonsListCacheKey(query.payload.sectionId);
    const cached = await this.cache.get<GetLessonsResponse[]>(cacheKey);
    if (cached) return cached;

    const lessons = await CourseLesson.find({
      where: { sectionId: query.payload.sectionId },
      order: { order: "ASC" },
    });

    const result = plainToInstance(GetLessonsResponse, lessons, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
