import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateCourseCategoryCommand} from "@/features/common/category/commands/update-category/update-category.command";
import {CoursesCategory} from "@/features/common/entities/category/courses-category.entity";
import {ILike, Not} from "typeorm";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {plainToInstance} from "class-transformer";
import {
    UpdateCourseCategoryResponse
} from "@/features/common/category/commands/update-category/update-category.response";
import {Cache} from "@nestjs/cache-manager";
import {
    COURSE_CATEGORIES_LIST_CACHE_KEY,
    courseCategoryByIdCacheKey,
} from "@/features/common/category/category.cache";

@CommandHandler(UpdateCourseCategoryCommand)
export class UpdateCourseCategoryHandler
    implements ICommandHandler<UpdateCourseCategoryCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: UpdateCourseCategoryCommand) {
        const category = await CoursesCategory.findOneBy({id: cmd.id});
        DoesNotExistException.ThrowIfNull(category, "Category not found");

        const titleExists = await CoursesCategory.existsBy({
            id: Not(cmd.id),
            title: ILike(cmd.title),
        });
        AlreadyExistException.ThrowIf(
            titleExists,
            "Category with this name already exists",
        );

        category.title = cmd.title;
        const saved = await category.save();

        await Promise.all([
            this.cache.del(COURSE_CATEGORIES_LIST_CACHE_KEY),
            this.cache.del(courseCategoryByIdCacheKey(cmd.id)),
        ]);

        return plainToInstance(UpdateCourseCategoryResponse, saved, {
            excludeExtraneousValues: true,
        });
    }
}
