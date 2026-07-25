import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoriesByIdQuery } from '@/features/library/category/queries/get-categories-by-id/get-categories-by-id.query';
import { Category } from '../../../entities/category/category.entity';
import { plainToInstance } from 'class-transformer';
import { GetCategoriesByIdResponse } from '@/features/library/category/queries/get-categories-by-id/get-categories-by-id.response';
import { DoesNotExistException } from '@/core/exceptions/does-not-exist.exception';

@QueryHandler(GetCategoriesByIdQuery)
export class GetCategoriesByIdHandler implements IQueryHandler<GetCategoriesByIdQuery> {
  async execute(query: GetCategoriesByIdQuery) {
    const category = await Category.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(category, 'Category not found');

    return plainToInstance(GetCategoriesByIdResponse, category, {
      excludeExtraneousValues: true,
    });
  }
}
