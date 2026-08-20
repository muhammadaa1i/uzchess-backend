import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBannerCommand } from "@/features/home/banner/commands/delete-banner/delete-banner.command";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { DeleteBannerResponse } from "@/features/home/banner/commands/delete-banner/delete-banner.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  BANNERS_LIST_CACHE_KEY,
  bannerByIdCacheKey,
} from "@/features/home/banner/banner.cache";

@CommandHandler(DeleteBannerCommand)
export class DeleteBannerHandler implements ICommandHandler<DeleteBannerCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteBannerCommand) {
    const banner = await Banner.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(banner, "Banner not found");

    await Banner.remove(banner);
    if (banner.imageUrl)
      await deleteUploadedFile(banner.imageUrl).catch(() => {});

    await Promise.all([
      this.cache.del(BANNERS_LIST_CACHE_KEY),
      this.cache.del(bannerByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(DeleteBannerResponse, {
      message: "Banner deleted successfully",
    });
  }
}
