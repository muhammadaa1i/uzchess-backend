import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteCourseCategoryCommand} from "@/features/common/category/commands/delete-category/delete-category.command";
import {CoursesCategory} from "@/features/common/entities/category/courses-category.entity";
import {Course} from "@/features/common/entities/course/course.entity";
import {ConflictException} from "@nestjs/common";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {
    DeleteCourseCategoryResponse
} from "@/features/common/category/commands/delete-category/delete-category.response";
import {Cache} from "@nestjs/cache-manager";
import {
    COURSE_CATEGORIES_LIST_CACHE_KEY,
    courseCategoryByIdCacheKey,
} from "@/features/common/category/category.cache";

@CommandHandler(DeleteCourseCategoryCommand)
export class DeleteCourseCategoryHandler
    implements ICommandHandler<DeleteCourseCategoryCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: DeleteCourseCategoryCommand) {
        const category = await CoursesCategory.findOneBy({id: cmd.id});
        DoesNotExistException.ThrowIfNull(category, "Category not found");

        const inUse = await Course.existsBy({categoryId: cmd.id});
        if (inUse)
            throw new ConflictException(
                "Category is still in use by one or more courses",
            );

        await CoursesCategory.remove(category);

        await Promise.all([
            this.cache.del(COURSE_CATEGORIES_LIST_CACHE_KEY),
            this.cache.del(courseCategoryByIdCacheKey(cmd.id)),
        ]);

        return plainToInstance(DeleteCourseCategoryResponse, {
            message: "Category deleted successfully",
        });
    }
}
