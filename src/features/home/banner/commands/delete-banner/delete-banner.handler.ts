import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBannerCommand } from "@/features/home/banner/commands/delete-banner/delete-banner.command";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { DeleteBannerResponse } from "@/features/home/banner/commands/delete-banner/delete-banner.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

@CommandHandler(DeleteBannerCommand)
export class DeleteBannerHandler implements ICommandHandler<DeleteBannerCommand> {
  async execute(cmd: DeleteBannerCommand) {
    const banner = await Banner.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(banner, "Banner not found");

    await Banner.remove(banner);
    if (banner.imageUrl)
      await deleteUploadedFile(banner.imageUrl).catch(() => {});

    return plainToInstance(DeleteBannerResponse, {
      message: "Banner deleted successfully",
    });
  }
}
