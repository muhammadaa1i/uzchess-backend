import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCourseCommand } from "@/features/common/courses/commands/delete-course/delete-course.command";
import { Course } from "@/features/common/entities/course/course.entity";
import { plainToInstance } from "class-transformer";
import { DeleteCourseResponse } from "@/features/common/courses/commands/delete-course/delete-course.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  COURSES_LIST_CACHE_KEY,
  TOP_RATED_COURSES_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler implements ICommandHandler<DeleteCourseCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteCourseCommand) {
    const course = await Course.findOne({
      where: { id: cmd.id },
      relations: { sections: { lessons: true } },
    });
    DoesNotExistException.ThrowIfNull(course, "Course not found");

    await Course.remove(course);
    await deleteUploadedFile(course.cover).catch(() => {});
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        await deleteUploadedFile(lesson.video).catch(() => {});
        if (lesson.thumbnail)
          await deleteUploadedFile(lesson.thumbnail).catch(() => {});
      }
    }

    await Promise.all([
      this.cache.del(COURSES_LIST_CACHE_KEY),
      this.cache.del(courseByIdCacheKey(cmd.id)),
      this.cache.del(TOP_RATED_COURSES_CACHE_KEY),
    ]);

    return plainToInstance(DeleteCourseResponse, {
      message: "Course deleted successfully",
    });
  }
}
