import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForbiddenException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { CreateLessonProgressCommand } from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.command";
import { CreateLessonProgressResponse } from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.response";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { PurchaseStatus } from "@/core/enums/purchase-status/purchase-status.enum";
import { LessonProgress } from "@/features/common/entities/progress/lesson-progress.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

@CommandHandler(CreateLessonProgressCommand)
export class CreateLessonProgressHandler
  implements ICommandHandler<CreateLessonProgressCommand>
{
  async execute(cmd: CreateLessonProgressCommand) {
    const lesson = await CourseLesson.findOne({
      where: { id: cmd.lessonId },
      relations: { section: true },
    });
    DoesNotExistException.ThrowIfNull(lesson, "Lesson not found");

    if (!lesson.isFree) {
      const purchase = await CoursePurchase.findOneBy({
        courseId: lesson.section.courseId,
        userId: cmd.userId,
        status: PurchaseStatus.Success,
      });
      if (!purchase) {
        throw new ForbiddenException("Course must be purchased to access this lesson");
      }
    }

    const existing = await LessonProgress.findOneBy({
      lessonId: cmd.lessonId,
      userId: cmd.userId,
    });
    const progress =
      existing ??
      (await LessonProgress.save(
        LessonProgress.create({
          lessonId: cmd.lessonId,
          userId: cmd.userId,
        }),
      ));

    return plainToInstance(CreateLessonProgressResponse, progress, {
      excludeExtraneousValues: true,
    });
  }
}
