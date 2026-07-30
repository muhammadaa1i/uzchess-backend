import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteSectionCommand } from "@/features/common/section/commands/delete-section/delete-section.command";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { DeleteSectionResponse } from "@/features/common/section/commands/delete-section/delete-section.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  sectionByIdCacheKey,
  sectionsListCacheKey,
} from "@/features/common/section/section.cache";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(DeleteSectionCommand)
export class DeleteSectionHandler implements ICommandHandler<DeleteSectionCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteSectionCommand) {
    const section = await CourseSection.findOne({
      where: { id: cmd.id },
      relations: { lessons: true },
    });
    DoesNotExistException.ThrowIfNull(section, "Section not found");

    await CourseSection.remove(section);
    for (const lesson of section.lessons) {
      await deleteUploadedFile(lesson.video).catch(() => {});
      if (lesson.thumbnail)
        await deleteUploadedFile(lesson.thumbnail).catch(() => {});
    }

    await Promise.all([
      this.cache.del(sectionsListCacheKey(section.courseId)),
      this.cache.del(sectionByIdCacheKey(cmd.id)),
      this.cache.del(courseByIdCacheKey(section.courseId)),
      this.cache.del(COURSES_LIST_CACHE_KEY),
    ]);

    return plainToInstance(DeleteSectionResponse, {
      message: "Section deleted successfully",
    });
  }
}
