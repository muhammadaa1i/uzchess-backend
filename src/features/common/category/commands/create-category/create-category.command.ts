import { CreateCourseCategoryRequest } from "@/features/common/category/commands/create-category/create-category.request";

export class CreateCourseCategoryCommand {
  constructor(public readonly payload: CreateCourseCategoryRequest) {}
}
