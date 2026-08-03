import { GetCourseCategoriesRequest } from "@/features/common/category/queries/get-categories/get-categories.request";

export class GetCourseCategoriesQuery {
  constructor(public readonly payload: GetCourseCategoriesRequest) {}
}
