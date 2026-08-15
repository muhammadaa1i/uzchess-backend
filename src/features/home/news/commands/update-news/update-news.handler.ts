import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateNewsCommand } from "@/features/home/news/commands/update-news/update-news.command";
import { News } from "@/features/home/entities/news/news.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateNewsResponse } from "@/features/home/news/commands/update-news/update-news.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

@CommandHandler(UpdateNewsCommand)
export class UpdateNewsHandler implements ICommandHandler<UpdateNewsCommand> {
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

    return plainToInstance(UpdateNewsResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
