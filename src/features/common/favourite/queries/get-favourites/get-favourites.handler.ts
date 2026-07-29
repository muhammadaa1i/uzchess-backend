import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetFavouritesQuery} from "@/features/common/favourite/queries/get-favourites/get-favourites.query";
import {CourseFavourite} from "@/features/common/entities/favourite/course-favourite.entity";
import {Course} from "@/features/common/entities/course/course.entity";
import {CourseRating} from "@/features/common/entities/rating/course-rating.entity";
import {CourseSection} from "@/features/common/entities/section/course-section.entity";
import {CourseLesson} from "@/features/common/entities/section/course-lesson.entity";
import {In} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetCourseFavouritesResponse} from "@/features/common/favourite/queries/get-favourites/get-favourites.response";

@QueryHandler(GetFavouritesQuery)
export class GetFavouritesHandler implements IQueryHandler<GetFavouritesQuery> {
    async execute(query: GetFavouritesQuery) {
        const favourites = await CourseFavourite.findBy({userId: query.userId});
        const courseIds = favourites.map((favourite) => favourite.courseId);

        const courses = courseIds.length
            ? await Course.find({
                where: {id: In(courseIds)},
                relations: {courseAuthors: true},
            })
            : [];

        const ratingRows = courseIds.length
            ? await CourseRating.createQueryBuilder("rating")
                .select("rating.courseId", "courseId")
                .addSelect("AVG(rating.score)", "average")
                .addSelect("COUNT(rating.id)", "count")
                .where("rating.courseId IN (:...courseIds)", {courseIds})
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
                .where("section.courseId IN (:...courseIds)", {courseIds})
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
                .where("section.courseId IN (:...courseIds)", {courseIds})
                .groupBy("section.courseId")
                .getRawMany<{ courseId: number; count: string }>()
            : [];
        const lessonsCountByCourseId = new Map(
            lessonsRows.map((row) => [row.courseId, parseInt(row.count, 10)]),
        );

        return plainToInstance(
            GetCourseFavouritesResponse,
            courses.map((course) => ({
                ...course,
                authorIds: course.courseAuthors.map((ca) => ca.authorId),
                ...(statsByCourseId.get(course.id) ?? {
                    averageRating: 0,
                    ratingsCount: 0,
                }),
                sectionsCount: sectionsCountByCourseId.get(course.id) ?? 0,
                lessonsCount: lessonsCountByCourseId.get(course.id) ?? 0,
            })),
            {excludeExtraneousValues: true},
        );
    }
}
