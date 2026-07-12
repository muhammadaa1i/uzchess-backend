import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCategoriesQuery} from "@/features/library/category/queries/get-categories/get-categories.query";
import {Category} from "@/features/library/entities/category.entity";
import {FindOptionsWhere, ILike} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetCategoriesResponse} from "@/features/library/category/queries/get-categories/get-categories.response";

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
    async execute(query: GetCategoriesQuery) {
        const take = query.size ?? 10;
        const currentPage = query.page ?? 1;
        const skip = (currentPage - 1) * take;

        const where: FindOptionsWhere<Category> = {};
        if (query.search) where.title = ILike(`%${query.search}%`);

        const totalCount = await Category.countBy(where);
        const totalPages = Math.ceil(totalCount / take);
        const hasNext = currentPage < totalPages;
        const hasPrevious = currentPage > 1;

        const categories = await Category.find({
            where: where,
            skip: skip,
            take: take,
        });

        const data = plainToInstance(GetCategoriesResponse, categories, {
            excludeExtraneousValues: true,
        });

        return {totalCount, totalPages, currentPage, hasNext, hasPrevious, data,};
    }
}
