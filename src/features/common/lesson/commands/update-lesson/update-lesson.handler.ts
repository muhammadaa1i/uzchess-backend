import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateLessonCommand } from "@/features/common/lesson/commands/update-lesson/update-lesson.command";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateLessonResponse } from "@/features/common/lesson/commands/update-lesson/update-lesson.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  lessonByIdCacheKey,
  lessonsListCacheKey,
} from "@/features/common/lesson/lesson.cache";
import { courseByIdCacheKey } from "@/features/common/courses/course.cache";

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonHandler implements ICommandHandler<UpdateLessonCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateLessonCommand) {
    const lesson = await CourseLesson.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(lesson, "Lesson not found");

    if (cmd.title !== undefined) lesson.title = cmd.title;
    if (cmd.duration !== undefined) lesson.duration = cmd.duration;
    if (cmd.order !== undefined) lesson.order = cmd.order;

    if (cmd.videoPath) {
      const oldVideo = lesson.video;
      lesson.video = cmd.videoPath;
      await deleteUploadedFile(oldVideo).catch(() => {});
    }

    if (cmd.thumbnailPath) {
      const oldThumbnail = lesson.thumbnail;
      lesson.thumbnail = cmd.thumbnailPath;
      if (oldThumbnail) await deleteUploadedFile(oldThumbnail).catch(() => {});
    }

    const saved = await lesson.save();

    const section = await CourseSection.findOneBy({ id: lesson.sectionId });

    await Promise.all([
      this.cache.del(lessonsListCacheKey(lesson.sectionId)),
      this.cache.del(lessonByIdCacheKey(cmd.id)),
      ...(section
        ? [this.cache.del(courseByIdCacheKey(section.courseId))]
        : []),
    ]);

    return plainToInstance(UpdateLessonResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
