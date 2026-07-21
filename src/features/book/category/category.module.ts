import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {CategoryController} from '@/features/book/category/category.controller';
import {CreateCategoryHandler} from '@/features/book/category/commands/create-category/create-category.handler';
import {UpdateCategoryHandler} from '@/features/book/category/commands/update-category/update-category.handler';
import {DeleteCategoryHandler} from '@/features/book/category/commands/delete-category/delete-category.handler';
import {GetCategoriesHandler} from '@/features/book/category/queries/get-categories/get-categories.handler';
import {
    GetCategoryByIdHandler
} from '@/features/book/category/queries/get-category-by-id/get-category-by-id.handler';

@Module({
    imports: [CqrsModule],
    controllers: [CategoryController],
    providers: [
        GetCategoriesHandler,
        GetCategoryByIdHandler,
        CreateCategoryHandler,
        UpdateCategoryHandler,
        DeleteCategoryHandler,
    ],
})
export class CategoryModule {
}
