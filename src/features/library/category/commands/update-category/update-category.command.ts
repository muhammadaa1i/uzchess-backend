import { UpdateCategoryRequest } from "@/features/library/category/commands/update-category/update-category.request";

export class UpdateCategoryCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateCategoryRequest,
  ) {}
}
