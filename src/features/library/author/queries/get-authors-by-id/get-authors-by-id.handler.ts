import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuthorsByIdQuery } from '@/features/library/author/queries/get-authors-by-id/get-authors-by-id.query';
import { Author } from '@/features/library/entities/author.entity';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GetAuthorsByIdResponse } from '@/features/library/author/queries/get-authors-by-id/get-authors-by-id.response';

@QueryHandler(GetAuthorsByIdQuery)
export class GetAuthorsByIdHandler implements IQueryHandler<GetAuthorsByIdQuery> {
  async execute(query: GetAuthorsByIdQuery) {
    const author = await Author.findOneBy({ id: query.id });

    if (!author) throw new NotFoundException('Author is not found');

    return plainToInstance(GetAuthorsByIdResponse, author, {
      excludeExtraneousValues: true,
    });
  }
}
