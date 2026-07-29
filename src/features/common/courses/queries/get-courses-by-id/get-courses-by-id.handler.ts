import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCoursesByIdQuery} from "@/features/common/courses/queries/get-courses-by-id/get-courses-by-id.query";
import {Course} from "@/features/common/entities/course/course.entity";
import {CourseRating} from "@/features/common/entities/rating/course-rating.entity";
import {plainToInstance} from "class-transformer";
import {GetCoursesByIdResponse} from "@/features/common/courses/queries/get-courses-by-id/get-courses-by-id.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {Cache} from "@nestjs/cache-manager";
import {courseByIdCacheKey} from "@/features/common/courses/course.cache";

@QueryHandler(GetCoursesByIdQuery)
export class GetCoursesByIdHandler
    implements IQueryHandler<GetCoursesByIdQuery> {
    constructor(private readonly cache: Cache) {
    }

    async execute(query: GetCoursesByIdQuery) {
        const cacheKey = courseByIdCacheKey(query.id);
        const cached = await this.cache.get<GetCoursesByIdResponse>(cacheKey);
        if (cached) return cached;

        const course = await Course.findOne({
            where: {id: query.id},
            relations: {courseAuthors: true, sections: {lessons: true}},
        });
        DoesNotExistException.ThrowIfNull(course, "Course not found");

        const sections = [...course.sections]
            .sort((a, b) => a.order - b.order)
            .map((section) => ({
                ...section,
                lessons: [...section.lessons].sort((a, b) => a.order - b.order),
            }));

        const ratingAgg = await CourseRating.createQueryBuilder("rating")
            .select("AVG(rating.score)", "average")
            .addSelect("COUNT(rating.id)", "count")
            .where("rating.courseId = :courseId", {courseId: course.id})
            .getRawOne<{ average: string | null; count: string }>();

        const result = plainToInstance(
            GetCoursesByIdResponse,
            {
                ...course,
                authorIds: course.courseAuthors.map((ca) => ca.authorId),
                averageRating: ratingAgg?.average
                    ? Math.round(parseFloat(ratingAgg.average) * 10) / 10
                    : 0,
                ratingsCount: ratingAgg ? parseInt(ratingAgg.count, 10) : 0,
                sectionsCount: sections.length,
                lessonsCount: sections.reduce(
                    (sum, section) => sum + section.lessons.length,
                    0,
                ),
                sections,
            },
            {excludeExtraneousValues: true},
        );

        await this.cache.set(cacheKey, result);

        return result;
    }
}
