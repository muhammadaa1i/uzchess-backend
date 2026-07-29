import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateSectionCommand} from "@/features/common/section/commands/create-section/create-section.command";
import {Course} from "@/features/common/entities/course/course.entity";
import {CourseSection} from "@/features/common/entities/section/course-section.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreateSectionResponse} from "@/features/common/section/commands/create-section/create-section.response";
import {Cache} from "@nestjs/cache-manager";
import {sectionsListCacheKey} from "@/features/common/section/section.cache";
import {
    COURSES_LIST_CACHE_KEY,
    courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(CreateSectionCommand)
export class CreateSectionHandler
    implements ICommandHandler<CreateSectionCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute(cmd: CreateSectionCommand) {
        const courseExists = await Course.existsBy({id: cmd.courseId});
        DoesNotExistException.ThrowIf(!courseExists, "Course not found");

        const section = CourseSection.create({
            courseId: cmd.courseId,
            title: cmd.title,
            order: cmd.order,
        });
        const saved = await CourseSection.save(section);

        await Promise.all([
            this.cache.del(sectionsListCacheKey(cmd.courseId)),
            this.cache.del(courseByIdCacheKey(cmd.courseId)),
            this.cache.del(COURSES_LIST_CACHE_KEY),
        ]);

        return plainToInstance(CreateSectionResponse, saved, {
            excludeExtraneousValues: true,
        });
    }
}
