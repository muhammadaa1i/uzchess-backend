import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ProgressController } from "@/features/common/progress/progress.controller";
import { GetCourseLessonsHandler } from "@/features/common/progress/queries/get-course-lessons/get-course-lessons.handler";
import { GetNextLessonHandler } from "@/features/common/progress/queries/get-next-lesson/get-next-lesson.handler";
import { CreateLessonProgressHandler } from "@/features/common/progress/commands/create-lesson-progress/create-lesson-progress.handler";

@Module({
  imports: [CqrsModule],
  controllers: [ProgressController],
  providers: [
    GetCourseLessonsHandler,
    GetNextLessonHandler,
    CreateLessonProgressHandler,
  ],
})
export class ProgressModule {}
