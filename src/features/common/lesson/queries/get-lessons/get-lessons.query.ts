import { GetLessonsRequest } from "@/features/common/lesson/queries/get-lessons/get-lessons.request";

export class GetLessonsQuery {
  constructor(public readonly payload: GetLessonsRequest) {}
}
