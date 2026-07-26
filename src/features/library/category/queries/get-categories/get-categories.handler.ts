import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCategoriesQuery } from "@/features/library/category/queries/get-categories/get-categories.query";
import { Category } from "../../../entities/category/category.entity";
import { FindOptionsWhere, ILike } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetCategoriesResponse } from "@/features/library/category/queries/get-categories/get-categories.response";
import { Cache } from "@nestjs/cache-manager";
import { CATEGORIES_LIST_CACHE_KEY } from "@/features/library/category/category.cache";

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetCategoriesQuery) {
    if (!query.search) {
      const cached = await this.cache.get<GetCategoriesResponse[]>(
        CATEGORIES_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const where: FindOptionsWhere<Category> = {};
    if (query.search) where.title = ILike(`%${query.search}%`);

    const categories = await Category.find({ where });

    const result = plainToInstance(GetCategoriesResponse, categories, {
      excludeExtraneousValues: true,
    });

    if (!query.search) await this.cache.set(CATEGORIES_LIST_CACHE_KEY, result);

    return result;
  }
}
