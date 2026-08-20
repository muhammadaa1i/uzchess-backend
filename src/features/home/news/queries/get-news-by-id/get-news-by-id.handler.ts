import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNewsByIdQuery } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.query";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { GetNewsByIdResponse } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { newsByIdCacheKey } from "@/features/home/news/news.cache";

@QueryHandler(GetNewsByIdQuery)
export class GetNewsByIdHandler implements IQueryHandler<GetNewsByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetNewsByIdQuery) {
    const cacheKey = newsByIdCacheKey(query.id);
    const cached = await this.cache.get<GetNewsByIdResponse>(cacheKey);
    if (cached) return cached;

    const news = await News.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(news, "News not found");

    const result = plainToInstance(GetNewsByIdResponse, news, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
