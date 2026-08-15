import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteNewsCommand } from "@/features/home/news/commands/delete-news/delete-news.command";
import { News } from "@/features/home/entities/news/news.entity";
import { plainToInstance } from "class-transformer";
import { DeleteNewsResponse } from "@/features/home/news/commands/delete-news/delete-news.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

@CommandHandler(DeleteNewsCommand)
export class DeleteNewsHandler implements ICommandHandler<DeleteNewsCommand> {
  async execute(cmd: DeleteNewsCommand) {
    const news = await News.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(news, "News not found");

    await News.remove(news);
    if (news.imageUrl) await deleteUploadedFile(news.imageUrl).catch(() => {});

    return plainToInstance(DeleteNewsResponse, {
      message: "News deleted successfully",
    });
  }
}
