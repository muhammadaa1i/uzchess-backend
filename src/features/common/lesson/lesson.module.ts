import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { LessonController } from "@/features/common/lesson/lesson.controller";
import { CreateLessonHandler } from "@/features/common/lesson/commands/create-lesson/create-lesson.handler";
import { UpdateLessonHandler } from "@/features/common/lesson/commands/update-lesson/update-lesson.handler";
import { DeleteLessonHandler } from "@/features/common/lesson/commands/delete-lesson/delete-lesson.handler";
import { GetLessonsHandler } from "@/features/common/lesson/queries/get-lessons/get-lessons.handler";
import { GetLessonsByIdHandler } from "@/features/common/lesson/queries/get-lessons-by-id/get-lessons-by-id.handler";

@Module({
  imports: [CqrsModule],
  controllers: [LessonController],
  providers: [
    GetLessonsHandler,
    GetLessonsByIdHandler,
    CreateLessonHandler,
    UpdateLessonHandler,
    DeleteLessonHandler,
  ],
})
export class LessonModule {}
