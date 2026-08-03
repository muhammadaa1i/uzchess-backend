import { GetCategoriesRequest } from "@/features/library/category/queries/get-categories/get-categories.request";

export class GetCategoriesQuery {
  constructor(public readonly payload: GetCategoriesRequest) {}
}
