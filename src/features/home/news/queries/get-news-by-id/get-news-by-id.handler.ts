import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNewsByIdQuery } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.query";
import { News } from "@/features/home/entities/news/news.entity";
import { Not } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetNewsByIdResponse } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.response";
import { GetNewsResponse } from "@/features/home/news/queries/get-news/get-news.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { newsByIdCacheKey } from "@/features/home/news/news.cache";

@QueryHandler(GetNewsByIdQuery)
export class GetNewsByIdHandler implements IQueryHandler<GetNewsByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetNewsByIdQuery) {
    const cacheKey = newsByIdCacheKey(query.id);

    // Increment must happen on every call, cache hit or miss, so the
    // counter reflects real traffic even when the cached body is served.
    // Uses an atomic query-builder UPDATE (BaseEntity has no Active Record
    // `.increment()` static — only `Repository` does) instead of
    // read-then-write to avoid lost updates under concurrent requests.
    await News.createQueryBuilder()
      .update(News)
      .set({ viewsCount: () => '"viewsCount" + 1' })
      .where("id = :id", { id: query.id })
      .execute();

    const cached = await this.cache.get<GetNewsByIdResponse>(cacheKey);
    if (cached) {
      // Same reasoning as the viewsCount overlay above: relatedNews is
      // computed from the rest of the table, so it can go stale (e.g. a
      // deleted/updated article lingering in it) for the life of this cache
      // entry unless it's also refreshed on every read, not just on writes
      // to this specific article.
      const [fresh, relatedNewsEntities] = await Promise.all([
        News.findOne({
          where: { id: query.id },
          select: { viewsCount: true },
        }),
        News.find({
          where: { id: Not(query.id) },
          order: { publishedAt: "DESC" },
          take: 3,
        }),
      ]);
      const relatedNews = plainToInstance(
        GetNewsResponse,
        relatedNewsEntities,
        { excludeExtraneousValues: true },
      );
      return {
        ...cached,
        viewsCount: fresh?.viewsCount ?? cached.viewsCount,
        relatedNews,
      };
    }

    const news = await News.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(news, "News not found");

    const relatedNewsEntities = await News.find({
      where: { id: Not(query.id) },
      order: { publishedAt: "DESC" },
      take: 3,
    });
    const relatedNews = plainToInstance(GetNewsResponse, relatedNewsEntities, {
      excludeExtraneousValues: true,
    });

    const result = plainToInstance(
      GetNewsByIdResponse,
      { ...news, relatedNews },
      { excludeExtraneousValues: true },
    );

    await this.cache.set(cacheKey, result);

    return result;
  }
}
