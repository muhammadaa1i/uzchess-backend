import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateNewsCommand } from "@/features/home/news/commands/create-news/create-news.command";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { CreateNewsResponse } from "@/features/home/news/commands/create-news/create-news.response";

@CommandHandler(CreateNewsCommand)
export class CreateNewsHandler implements ICommandHandler<CreateNewsCommand> {
  async execute(cmd: CreateNewsCommand) {
    const news = News.create({
      title: cmd.payload.title,
      excerpt: cmd.payload.excerpt,
      imageUrl: cmd.imagePath ?? null,
      publishedAt: new Date(cmd.payload.publishedAt),
    });
    const saved = await News.save(news);

    return plainToInstance(CreateNewsResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
