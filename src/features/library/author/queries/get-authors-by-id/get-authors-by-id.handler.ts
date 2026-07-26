import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAuthorsByIdQuery } from "@/features/library/author/queries/get-authors-by-id/get-authors-by-id.query";
import { Author } from "../../../entities/author/author.entity";
import { plainToInstance } from "class-transformer";
import { GetAuthorsByIdResponse } from "@/features/library/author/queries/get-authors-by-id/get-authors-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { authorByIdCacheKey } from "@/features/library/author/author.cache";

@QueryHandler(GetAuthorsByIdQuery)
export class GetAuthorsByIdHandler implements IQueryHandler<GetAuthorsByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetAuthorsByIdQuery) {
    const cacheKey = authorByIdCacheKey(query.id);
    const cached = await this.cache.get<GetAuthorsByIdResponse>(cacheKey);
    if (cached) return cached;

    const author = await Author.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(author, "Author is not found");

    const result = plainToInstance(GetAuthorsByIdResponse, author, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
