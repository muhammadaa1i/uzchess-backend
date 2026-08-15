import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteRatingCommand} from "@/features/common/rating/commands/delete-rating/delete-rating.command";
import {CourseRating} from "@/features/common/entities/rating/course-rating.entity";
import {plainToInstance} from "class-transformer";
import {DeleteCourseRatingResponse} from "@/features/common/rating/commands/delete-rating/delete-rating.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {Cache} from "@nestjs/cache-manager";
import {
    COURSES_LIST_CACHE_KEY,
    TOP_RATED_COURSES_CACHE_KEY,
    courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(DeleteRatingCommand)
export class DeleteRatingHandler
    implements ICommandHandler<DeleteRatingCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: DeleteRatingCommand) {
        const rating = await CourseRating.findOneBy({
            courseId: cmd.courseId,
            userId: cmd.userId,
        });
        DoesNotExistException.ThrowIfNull(rating, "Rating not found");

        await CourseRating.remove(rating);

        await Promise.all([
            this.cache.del(COURSES_LIST_CACHE_KEY),
            this.cache.del(courseByIdCacheKey(cmd.courseId)),
            this.cache.del(TOP_RATED_COURSES_CACHE_KEY),
        ]);

        return plainToInstance(DeleteCourseRatingResponse, {
            message: "Rating deleted successfully",
        });
    }
}
