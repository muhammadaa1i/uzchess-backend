import { UpdateCourseRequest } from "@/features/common/courses/commands/update-course/update-course.request";

export class UpdateCourseCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateCourseRequest,
    public readonly coverPath: string | undefined,
  ) {}
}
