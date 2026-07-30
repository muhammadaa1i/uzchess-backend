import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteLessonCommand } from "@/features/common/lesson/commands/delete-lesson/delete-lesson.command";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { DeleteLessonResponse } from "@/features/common/lesson/commands/delete-lesson/delete-lesson.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  lessonByIdCacheKey,
  lessonsListCacheKey,
} from "@/features/common/lesson/lesson.cache";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(DeleteLessonCommand)
export class DeleteLessonHandler implements ICommandHandler<DeleteLessonCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteLessonCommand) {
    const lesson = await CourseLesson.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(lesson, "Lesson not found");

    const section = await CourseSection.findOneBy({ id: lesson.sectionId });

    await CourseLesson.remove(lesson);
    await deleteUploadedFile(lesson.video).catch(() => {});
    if (lesson.thumbnail)
      await deleteUploadedFile(lesson.thumbnail).catch(() => {});

    await Promise.all([
      this.cache.del(lessonsListCacheKey(lesson.sectionId)),
      this.cache.del(lessonByIdCacheKey(cmd.id)),
      this.cache.del(COURSES_LIST_CACHE_KEY),
      ...(section
        ? [this.cache.del(courseByIdCacheKey(section.courseId))]
        : []),
    ]);

    return plainToInstance(DeleteLessonResponse, {
      message: "Lesson deleted successfully",
    });
  }
}
