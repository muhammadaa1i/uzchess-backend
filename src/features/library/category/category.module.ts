import {Module} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {CategoryController} from '@/features/library/category/category.controller';
import {CreateCategoryHandler} from '@/features/library/category/commands/create-category/create-category.handler';
import {UpdateCategoryHandler} from '@/features/library/category/commands/update-category/update-category.handler';
import {DeleteCategoryHandler} from '@/features/library/category/commands/delete-category/delete-category.handler';
import {GetCategoriesHandler} from '@/features/library/category/queries/get-categories/get-categories.handler';
import {
    GetCategoriesByIdHandler
} from '@/features/library/category/queries/get-categories-by-id/get-categories-by-id.handler';

@Module({
    imports: [CqrsModule],
    controllers: [CategoryController],
    providers: [
        GetCategoriesHandler,
        GetCategoriesByIdHandler,
        CreateCategoryHandler,
        UpdateCategoryHandler,
        DeleteCategoryHandler,
    ],
})
export class CategoryModule {
}
