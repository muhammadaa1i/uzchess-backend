import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuthorsQuery } from '@/features/library/author/queries/get-authors/get-authors.query';
import { Author } from '@/features/library/entities/author.entity';
import { plainToInstance } from 'class-transformer';
import { GetAuthorsResponse } from '@/features/library/author/queries/get-authors/get-authors.response';

@QueryHandler(GetAuthorsQuery)
export class GetAuthorsHandler implements IQueryHandler<GetAuthorsQuery> {
  async execute() {
    const authors = await Author.find();
    return plainToInstance(GetAuthorsResponse, authors, {
      excludeExtraneousValues: true,
    });
  }
}