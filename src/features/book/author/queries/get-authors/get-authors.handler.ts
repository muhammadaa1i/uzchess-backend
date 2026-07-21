import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuthorsQuery } from '@/features/book/author/queries/get-authors/get-authors.query';
import { Author } from '@/features/book/entities/author.entity';
import { plainToInstance } from 'class-transformer';
import { GetAuthorsResponse } from '@/features/book/author/queries/get-authors/get-authors.response';

@QueryHandler(GetAuthorsQuery)
export class GetAuthorsHandler implements IQueryHandler<GetAuthorsQuery> {
  async execute() {
    const authors = await Author.find();
    return plainToInstance(GetAuthorsResponse, authors, {
      excludeExtraneousValues: true,
    });
  }
}