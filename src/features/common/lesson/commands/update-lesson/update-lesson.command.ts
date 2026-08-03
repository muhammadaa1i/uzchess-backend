import { UpdateLessonRequest } from "@/features/common/lesson/commands/update-lesson/update-lesson.request";

export class UpdateLessonCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateLessonRequest,
    public readonly videoPath: string | undefined,
    public readonly thumbnailPath: string | undefined,
  ) {}
}
