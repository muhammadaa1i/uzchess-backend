import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetNewsByIdQuery } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.query";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { GetNewsByIdResponse } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetNewsByIdQuery)
export class GetNewsByIdHandler implements IQueryHandler<GetNewsByIdQuery> {
  async execute(query: GetNewsByIdQuery) {
    const news = await News.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(news, "News not found");

    return plainToInstance(GetNewsByIdResponse, news, {
      excludeExtraneousValues: true,
    });
  }
}
