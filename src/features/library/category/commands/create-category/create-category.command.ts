import { CreateCategoryRequest } from "@/features/library/category/commands/create-category/create-category.request";

export class CreateCategoryCommand {
  constructor(public readonly payload: CreateCategoryRequest) {}
}
