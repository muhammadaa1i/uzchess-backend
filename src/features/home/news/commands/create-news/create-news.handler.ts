import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateNewsCommand } from "@/features/home/news/commands/create-news/create-news.command";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { CreateNewsResponse } from "@/features/home/news/commands/create-news/create-news.response";
import { Cache } from "@nestjs/cache-manager";
import { NEWS_LIST_CACHE_KEY } from "@/features/home/news/news.cache";

@CommandHandler(CreateNewsCommand)
export class CreateNewsHandler implements ICommandHandler<CreateNewsCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateNewsCommand) {
    const news = News.create({
      title: cmd.payload.title,
      excerpt: cmd.payload.excerpt,
      content: cmd.payload.content,
      imageUrl: cmd.imagePath ?? null,
      publishedAt: new Date(cmd.payload.publishedAt),
    });
    const saved = await News.save(news);

    await this.cache.del(NEWS_LIST_CACHE_KEY);

    return plainToInstance(CreateNewsResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
