import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCategoriesByIdQuery } from "@/features/library/category/queries/get-categories-by-id/get-categories-by-id.query";
import { Category } from "../../../entities/category/category.entity";
import { plainToInstance } from "class-transformer";
import { GetCategoriesByIdResponse } from "@/features/library/category/queries/get-categories-by-id/get-categories-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { categoryByIdCacheKey } from "@/features/library/category/category.cache";

@QueryHandler(GetCategoriesByIdQuery)
export class GetCategoriesByIdHandler implements IQueryHandler<GetCategoriesByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetCategoriesByIdQuery) {
    const cacheKey = categoryByIdCacheKey(query.id);
    const cached = await this.cache.get<GetCategoriesByIdResponse>(cacheKey);
    if (cached) return cached;

    const category = await Category.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(category, "Category not found");

    const result = plainToInstance(GetCategoriesByIdResponse, category, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
