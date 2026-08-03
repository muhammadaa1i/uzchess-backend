import { UpdateCourseCategoryRequest } from "@/features/common/category/commands/update-category/update-category.request";

export class UpdateCourseCategoryCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateCourseCategoryRequest,
  ) {}
}
