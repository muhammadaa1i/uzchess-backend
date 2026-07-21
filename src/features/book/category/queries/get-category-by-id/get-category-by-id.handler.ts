import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoryByIdQuery } from '@/features/book/category/queries/get-category-by-id/get-category-by-id.query';
import { Category } from '@/features/book/entities/category.entity';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GetCategoryByIdResponse } from '@/features/book/category/queries/get-category-by-id/get-category-by-id.response';

@QueryHandler(GetCategoryByIdQuery)
export class GetCategoryByIdHandler implements IQueryHandler<GetCategoryByIdQuery> {
  async execute(query: GetCategoryByIdQuery) {
    const category = await Category.findOneBy({ id: query.id });

    if (!category) throw new NotFoundException('Category not found');

    return plainToInstance(GetCategoryByIdResponse, category, {
      excludeExtraneousValues: true,
    });
  }
}
