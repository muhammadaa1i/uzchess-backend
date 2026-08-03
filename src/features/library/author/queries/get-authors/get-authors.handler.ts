import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAuthorsQuery } from "@/features/library/author/queries/get-authors/get-authors.query";
import { Author } from "../../../entities/author/author.entity";
import { FindOptionsWhere, ILike } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetAuthorsResponse } from "@/features/library/author/queries/get-authors/get-authors.response";
import { Cache } from "@nestjs/cache-manager";
import { AUTHORS_LIST_CACHE_KEY } from "@/features/library/author/author.cache";

@QueryHandler(GetAuthorsQuery)
export class GetAuthorsHandler implements IQueryHandler<GetAuthorsQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetAuthorsQuery) {
    if (!query.payload.search) {
      const cached = await this.cache.get<GetAuthorsResponse[]>(
        AUTHORS_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const where: FindOptionsWhere<Author> = {};
    if (query.payload.search)
      where.fullName = ILike(`%${query.payload.search}%`);

    const authors = await Author.find({ where });
    const result = plainToInstance(GetAuthorsResponse, authors, {
      excludeExtraneousValues: true,
    });

    if (!query.payload.search)
      await this.cache.set(AUTHORS_LIST_CACHE_KEY, result);

    return result;
  }
}
