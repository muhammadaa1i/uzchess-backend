import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNewsQuery } from "@/features/home/news/queries/get-news/get-news.query";
import { News } from "@/features/home/entities/news/news.entity";
import { FindOptionsWhere, ILike } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetNewsResponse } from "@/features/home/news/queries/get-news/get-news.response";
import { PaginatedResultDto } from "@/core/dtos/paginated-result.dto";
import { Cache } from "@nestjs/cache-manager";
import {
  CachedNewsList,
  NEWS_LIST_CACHE_KEY,
} from "@/features/home/news/news.cache";

@QueryHandler(GetNewsQuery)
export class GetNewsHandler implements IQueryHandler<GetNewsQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetNewsQuery) {
    const isDefaultQuery =
      !query.payload.search && !query.payload.page && !query.payload.size;

    if (isDefaultQuery) {
      const cached = await this.cache.get<CachedNewsList>(
        NEWS_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const where: FindOptionsWhere<News> = {};
    if (query.payload.search) where.title = ILike(`%${query.payload.search}%`);

    const news = await News.find({ where, order: { publishedAt: "DESC" } });

    const take = query.payload.size ?? 12;
    const currentPage = query.payload.page ?? 1;
    const skip = (currentPage - 1) * take;
    const totalCount = news.length;
    const totalPages = Math.ceil(totalCount / take);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    const data = plainToInstance(
      GetNewsResponse,
      news.slice(skip, skip + take),
      { excludeExtraneousValues: true },
    );

    const result = plainToInstance(
      PaginatedResultDto(GetNewsResponse),
      { totalCount, totalPages, currentPage, hasNext, hasPrevious, data },
      { excludeExtraneousValues: true },
    );

    if (isDefaultQuery) await this.cache.set(NEWS_LIST_CACHE_KEY, result);

    return result;
  }
}
