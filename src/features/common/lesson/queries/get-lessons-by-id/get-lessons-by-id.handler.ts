import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetLessonsByIdQuery} from "@/features/common/lesson/queries/get-lessons-by-id/get-lessons-by-id.query";
import {CourseLesson} from "@/features/common/entities/section/course-lesson.entity";
import {plainToInstance} from "class-transformer";
import {GetLessonsByIdResponse} from "@/features/common/lesson/queries/get-lessons-by-id/get-lessons-by-id.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {Cache} from "@nestjs/cache-manager";
import {lessonByIdCacheKey} from "@/features/common/lesson/lesson.cache";

@QueryHandler(GetLessonsByIdQuery)
export class GetLessonsByIdHandler
    implements IQueryHandler<GetLessonsByIdQuery> {
    constructor(private readonly cache: Cache) {
    }

    async execute(query: GetLessonsByIdQuery) {
        const cacheKey = lessonByIdCacheKey(query.id);
        const cached = await this.cache.get<GetLessonsByIdResponse>(cacheKey);
        if (cached) return cached;

        const lesson = await CourseLesson.findOneBy({id: query.id});
        DoesNotExistException.ThrowIfNull(lesson, "Lesson not found");

        const result = plainToInstance(GetLessonsByIdResponse, lesson, {
            excludeExtraneousValues: true,
        });

        await this.cache.set(cacheKey, result);

        return result;
    }
}
