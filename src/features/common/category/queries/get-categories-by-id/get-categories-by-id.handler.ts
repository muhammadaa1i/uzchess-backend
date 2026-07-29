import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCourseCategoriesByIdQuery } from "@/features/common/category/queries/get-categories-by-id/get-categories-by-id.query";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { plainToInstance } from "class-transformer";
import { GetCourseCategoriesByIdResponse } from "@/features/common/category/queries/get-categories-by-id/get-categories-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { courseCategoryByIdCacheKey } from "@/features/common/category/category.cache";

@QueryHandler(GetCourseCategoriesByIdQuery)
export class GetCourseCategoriesByIdHandler
  implements IQueryHandler<GetCourseCategoriesByIdQuery>
{
  constructor(private readonly cache: Cache) {}

  async execute(query: GetCourseCategoriesByIdQuery) {
    const cacheKey = courseCategoryByIdCacheKey(query.id);
    const cached =
      await this.cache.get<GetCourseCategoriesByIdResponse>(cacheKey);
    if (cached) return cached;

    const category = await CoursesCategory.findOneBy({ id: query.id });
    DoesNotExistException.ThrowIfNull(category, "Category not found");

    const result = plainToInstance(GetCourseCategoriesByIdResponse, category, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
