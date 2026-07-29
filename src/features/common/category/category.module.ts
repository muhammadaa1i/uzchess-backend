import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CategoryController } from "@/features/common/category/category.controller";
import { CreateCourseCategoryHandler } from "@/features/common/category/commands/create-category/create-category.handler";
import { UpdateCourseCategoryHandler } from "@/features/common/category/commands/update-category/update-category.handler";
import { DeleteCourseCategoryHandler } from "@/features/common/category/commands/delete-category/delete-category.handler";
import { GetCourseCategoriesHandler } from "@/features/common/category/queries/get-categories/get-categories.handler";
import { GetCourseCategoriesByIdHandler } from "@/features/common/category/queries/get-categories-by-id/get-categories-by-id.handler";

@Module({
  imports: [CqrsModule],
  controllers: [CategoryController],
  providers: [
    GetCourseCategoriesHandler,
    GetCourseCategoriesByIdHandler,
    CreateCourseCategoryHandler,
    UpdateCourseCategoryHandler,
    DeleteCourseCategoryHandler,
  ],
})
export class CategoryModule {}
