import { GetCoursesRequest } from "@/features/common/courses/queries/get-courses/get-courses.request";

export class GetCoursesQuery {
  constructor(public readonly payload: GetCoursesRequest) {}
}
