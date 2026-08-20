import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNewsQuery } from "@/features/home/news/queries/get-news/get-news.query";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { GetNewsResponse } from "@/features/home/news/queries/get-news/get-news.response";
import { Cache } from "@nestjs/cache-manager";
import { NEWS_LIST_CACHE_KEY } from "@/features/home/news/news.cache";

@QueryHandler(GetNewsQuery)
export class GetNewsHandler implements IQueryHandler<GetNewsQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetNewsQuery) {
    const isDefaultQuery = query.payload.limit === undefined;

    if (isDefaultQuery) {
      const cached = await this.cache.get<GetNewsResponse[]>(
        NEWS_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const news = await News.find({
      order: { publishedAt: "DESC" },
      take: query.payload.limit ?? 4,
    });

    const result = plainToInstance(GetNewsResponse, news, {
      excludeExtraneousValues: true,
    });

    if (isDefaultQuery) await this.cache.set(NEWS_LIST_CACHE_KEY, result);

    return result;
  }
}
