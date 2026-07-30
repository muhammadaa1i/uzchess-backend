import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCourseCommand } from "@/features/common/courses/commands/update-course/update-course.command";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseAuthor } from "@/features/common/entities/course/course-author.entity";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Language } from "@/features/library/entities/languages/language.entity";
import { Author } from "@/features/library/entities/author/author.entity";
import { In } from "typeorm";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateCourseResponse } from "@/features/common/courses/commands/update-course/update-course.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<UpdateCourseCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateCourseCommand) {
    const course = await Course.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(course, "Course not found");

    if (cmd.categoryId !== undefined) {
      const categoryExists = await CoursesCategory.existsBy({
        id: cmd.categoryId,
      });
      DoesNotExistException.ThrowIf(!categoryExists, "Category not found");
      course.categoryId = cmd.categoryId;
    }

    if (cmd.difficultyId !== undefined) {
      const difficultyExists = await Difficulty.existsBy({
        id: cmd.difficultyId,
      });
      DoesNotExistException.ThrowIf(!difficultyExists, "Difficulty not found");
      course.difficultyId = cmd.difficultyId;
    }

    if (cmd.languageId !== undefined) {
      const languageExists = await Language.existsBy({ id: cmd.languageId });
      DoesNotExistException.ThrowIf(!languageExists, "Language not found");
      course.languageId = cmd.languageId;
    }

    if (cmd.title !== undefined) course.title = cmd.title;
    if (cmd.price !== undefined) course.price = cmd.price;
    if (cmd.discountPrice !== undefined)
      course.discountPrice = cmd.discountPrice;
    if (cmd.description !== undefined) course.description = cmd.description;

    if (cmd.coverPath) {
      const oldCover = course.cover;
      course.cover = cmd.coverPath;
      await deleteUploadedFile(oldCover).catch(() => {});
    }

    await course.save();

    let authorIds = cmd.authorIds;
    if (authorIds) {
      const authorsCount = await Author.countBy({ id: In(authorIds) });
      DoesNotExistException.ThrowIf(
        authorsCount !== authorIds.length,
        "One or more authors not found",
      );

      await CourseAuthor.delete({ courseId: course.id });
      const courseAuthors = authorIds.map((authorId) =>
        CourseAuthor.create({ courseId: course.id, authorId }),
      );
      await CourseAuthor.save(courseAuthors);
    } else {
      const existing = await CourseAuthor.findBy({ courseId: course.id });
      authorIds = existing.map((ca) => ca.authorId);
    }

    await Promise.all([
      this.cache.del(COURSES_LIST_CACHE_KEY),
      this.cache.del(courseByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(
      UpdateCourseResponse,
      {
        ...course,
        authorIds,
      },
      { excludeExtraneousValues: true },
    );
  }
}
