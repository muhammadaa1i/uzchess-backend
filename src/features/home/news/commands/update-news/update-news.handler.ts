import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateNewsCommand } from "@/features/home/news/commands/update-news/update-news.command";
import { News } from "@/features/home/entities/news/news.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateNewsResponse } from "@/features/home/news/commands/update-news/update-news.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  NEWS_LIST_CACHE_KEY,
  newsByIdCacheKey,
} from "@/features/home/news/news.cache";

@CommandHandler(UpdateNewsCommand)
export class UpdateNewsHandler implements ICommandHandler<UpdateNewsCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateNewsCommand) {
    const news = await News.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(news, "News not found");

    if (cmd.payload.title !== undefined) news.title = cmd.payload.title;
    if (cmd.payload.excerpt !== undefined) news.excerpt = cmd.payload.excerpt;
    if (cmd.payload.publishedAt !== undefined)
      news.publishedAt = new Date(cmd.payload.publishedAt);

    if (cmd.imagePath) {
      const oldImage = news.imageUrl;
      news.imageUrl = cmd.imagePath;
      if (oldImage) await deleteUploadedFile(oldImage).catch(() => {});
    }

    const saved = await news.save();

    await Promise.all([
      this.cache.del(NEWS_LIST_CACHE_KEY),
      this.cache.del(newsByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(UpdateNewsResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
