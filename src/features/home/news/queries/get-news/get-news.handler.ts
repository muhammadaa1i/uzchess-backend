import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNewsQuery } from "@/features/home/news/queries/get-news/get-news.query";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { GetNewsResponse } from "@/features/home/news/queries/get-news/get-news.response";

@QueryHandler(GetNewsQuery)
export class GetNewsHandler implements IQueryHandler<GetNewsQuery> {
  async execute(query: GetNewsQuery) {
    const news = await News.find({
      order: { publishedAt: "DESC" },
      take: query.payload.limit ?? 4,
    });

    return plainToInstance(GetNewsResponse, news, {
      excludeExtraneousValues: true,
    });
  }
}
