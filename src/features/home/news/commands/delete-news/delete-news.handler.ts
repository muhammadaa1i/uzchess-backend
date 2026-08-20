import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteNewsCommand } from "@/features/home/news/commands/delete-news/delete-news.command";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { DeleteNewsResponse } from "@/features/home/news/commands/delete-news/delete-news.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  NEWS_LIST_CACHE_KEY,
  newsByIdCacheKey,
} from "@/features/home/news/news.cache";

@CommandHandler(DeleteNewsCommand)
export class DeleteNewsHandler implements ICommandHandler<DeleteNewsCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteNewsCommand) {
    const news = await News.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(news, "News not found");

    await News.remove(news);
    if (news.imageUrl) await deleteUploadedFile(news.imageUrl).catch(() => {});

    await Promise.all([
      this.cache.del(NEWS_LIST_CACHE_KEY),
      this.cache.del(newsByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(DeleteNewsResponse, {
      message: "News deleted successfully",
    });
  }
}
