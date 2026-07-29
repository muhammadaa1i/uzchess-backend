import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateCourseCommand} from "@/features/common/courses/commands/create-course/create-course.command";
import {Course} from "@/features/common/entities/course/course.entity";
import {CourseAuthor} from "@/features/common/entities/course/course-author.entity";
import {CoursesCategory} from "@/features/common/entities/category/courses-category.entity";
import {Difficulty} from "@/features/library/entities/difficulty/difficulty.entity";
import {Language} from "@/features/library/entities/languages/language.entity";
import {Author} from "@/features/library/entities/author/author.entity";
import {In} from "typeorm";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreateCourseResponse} from "@/features/common/courses/commands/create-course/create-course.response";
import {Cache} from "@nestjs/cache-manager";
import {COURSES_LIST_CACHE_KEY} from "@/features/common/courses/course.cache";

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler
    implements ICommandHandler<CreateCourseCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: CreateCourseCommand) {
        const categoryExists = await CoursesCategory.existsBy({
            id: cmd.categoryId,
        });
        DoesNotExistException.ThrowIf(!categoryExists, "Category not found");

        const difficultyExists = await Difficulty.existsBy({
            id: cmd.difficultyId,
        });
        DoesNotExistException.ThrowIf(!difficultyExists, "Difficulty not found");

        const languageExists = await Language.existsBy({id: cmd.languageId});
        DoesNotExistException.ThrowIf(!languageExists, "Language not found");

        const authorsCount = await Author.countBy({id: In(cmd.authorIds)});
        DoesNotExistException.ThrowIf(
            authorsCount !== cmd.authorIds.length,
            "One or more authors not found",
        );

        const course = Course.create({
            title: cmd.title,
            price: cmd.price,
            discountPrice: cmd.discountPrice ?? null,
            cover: cmd.coverPath,
            description: cmd.description,
            categoryId: cmd.categoryId,
            difficultyId: cmd.difficultyId,
            languageId: cmd.languageId,
        });
        await Course.save(course);

        const courseAuthors = cmd.authorIds.map((authorId) =>
            CourseAuthor.create({courseId: course.id, authorId}),
        );
        await CourseAuthor.save(courseAuthors);

        await this.cache.del(COURSES_LIST_CACHE_KEY);

        return plainToInstance(
            CreateCourseResponse,
            {
                ...course,
                authorIds: cmd.authorIds,
            },
            {excludeExtraneousValues: true},
        );
    }
}
