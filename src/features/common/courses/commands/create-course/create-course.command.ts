import { CreateCourseRequest } from "@/features/common/courses/commands/create-course/create-course.request";

export class CreateCourseCommand {
  constructor(
    public readonly payload: CreateCourseRequest,
    public readonly coverPath: string,
  ) {}
}
