import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateRatingCommand} from "@/features/common/rating/commands/create-rating/create-rating.command";
import {Course} from "@/features/common/entities/course/course.entity";
import {CourseRating} from "@/features/common/entities/rating/course-rating.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreateCourseRatingResponse} from "@/features/common/rating/commands/create-rating/create-rating.response";
import {Cache} from "@nestjs/cache-manager";
import {
    COURSES_LIST_CACHE_KEY,
    courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(CreateRatingCommand)
export class CreateRatingHandler
    implements ICommandHandler<CreateRatingCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: CreateRatingCommand) {
        const courseExists = await Course.existsBy({id: cmd.courseId});
        DoesNotExistException.ThrowIf(!courseExists, "Course not found");

        let rating = await CourseRating.findOneBy({
            courseId: cmd.courseId,
            userId: cmd.userId,
        });
        if (rating) {
            rating.score = cmd.score;
            if (cmd.comment !== undefined) rating.comment = cmd.comment;
        } else {
            rating = CourseRating.create({
                courseId: cmd.courseId,
                userId: cmd.userId,
                score: cmd.score,
                comment: cmd.comment ?? null,
            });
        }
        await CourseRating.save(rating);

        const ratingAgg = await CourseRating.createQueryBuilder("rating")
            .select("AVG(rating.score)", "average")
            .addSelect("COUNT(rating.id)", "count")
            .where("rating.courseId = :courseId", {courseId: cmd.courseId})
            .getRawOne<{ average: string | null; count: string }>();

        await Promise.all([
            this.cache.del(COURSES_LIST_CACHE_KEY),
            this.cache.del(courseByIdCacheKey(cmd.courseId)),
        ]);

        return plainToInstance(
            CreateCourseRatingResponse,
            {
                courseId: cmd.courseId,
                score: cmd.score,
                comment: rating.comment,
                averageRating: ratingAgg?.average
                    ? Math.round(parseFloat(ratingAgg.average) * 10) / 10
                    : 0,
                ratingsCount: ratingAgg ? parseInt(ratingAgg.count, 10) : 0,
            },
            {excludeExtraneousValues: true},
        );
    }
}
