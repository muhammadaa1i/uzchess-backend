import { CreateLessonRequest } from "@/features/common/lesson/commands/create-lesson/create-lesson.request";

export class CreateLessonCommand {
  constructor(
    public readonly payload: CreateLessonRequest,
    public readonly videoPath: string,
    public readonly thumbnailPath: string | undefined,
  ) {}
}
