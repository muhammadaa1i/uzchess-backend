import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCourseCategoriesQuery} from "@/features/common/category/queries/get-categories/get-categories.query";
import {CoursesCategory} from "@/features/common/entities/category/courses-category.entity";
import {FindOptionsWhere, ILike} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetCourseCategoriesResponse} from "@/features/common/category/queries/get-categories/get-categories.response";
import {Cache} from "@nestjs/cache-manager";
import {COURSE_CATEGORIES_LIST_CACHE_KEY} from "@/features/common/category/category.cache";

@QueryHandler(GetCourseCategoriesQuery)
export class GetCourseCategoriesHandler
    implements IQueryHandler<GetCourseCategoriesQuery> {
    constructor(private readonly cache: Cache) {
    }

    async execute(query: GetCourseCategoriesQuery) {
        if (!query.search) {
            const cached = await this.cache.get<GetCourseCategoriesResponse[]>(
                COURSE_CATEGORIES_LIST_CACHE_KEY,
            );
            if (cached) return cached;
        }

        const where: FindOptionsWhere<CoursesCategory> = {};
        if (query.search) where.title = ILike(`%${query.search}%`);

        const categories = await CoursesCategory.find({where});

        const result = plainToInstance(GetCourseCategoriesResponse, categories, {
            excludeExtraneousValues: true,
        });

        if (!query.search)
            await this.cache.set(COURSE_CATEGORIES_LIST_CACHE_KEY, result);

        return result;
    }
}
