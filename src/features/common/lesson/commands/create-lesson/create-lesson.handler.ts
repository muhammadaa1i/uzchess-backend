import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateLessonCommand } from "@/features/common/lesson/commands/create-lesson/create-lesson.command";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateLessonResponse } from "@/features/common/lesson/commands/create-lesson/create-lesson.response";
import { Cache } from "@nestjs/cache-manager";
import { lessonsListCacheKey } from "@/features/common/lesson/lesson.cache";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(CreateLessonCommand)
export class CreateLessonHandler implements ICommandHandler<CreateLessonCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateLessonCommand) {
    const section = await CourseSection.findOneBy({
      id: cmd.payload.sectionId,
    });
    DoesNotExistException.ThrowIfNull(section, "Section not found");

    const lesson = CourseLesson.create({
      sectionId: cmd.payload.sectionId,
      title: cmd.payload.title,
      video: cmd.videoPath,
      thumbnail: cmd.thumbnailPath ?? null,
      duration: cmd.payload.duration,
      order: cmd.payload.order,
    });
    const saved = await CourseLesson.save(lesson);

    await Promise.all([
      this.cache.del(lessonsListCacheKey(cmd.payload.sectionId)),
      this.cache.del(courseByIdCacheKey(section.courseId)),
      this.cache.del(COURSES_LIST_CACHE_KEY),
    ]);

    return plainToInstance(CreateLessonResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
