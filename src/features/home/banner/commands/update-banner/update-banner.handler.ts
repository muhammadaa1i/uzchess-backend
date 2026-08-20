import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBannerCommand } from "@/features/home/banner/commands/update-banner/update-banner.command";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateBannerResponse } from "@/features/home/banner/commands/update-banner/update-banner.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import { Cache } from "@nestjs/cache-manager";
import {
  BANNERS_LIST_CACHE_KEY,
  bannerByIdCacheKey,
} from "@/features/home/banner/banner.cache";

@CommandHandler(UpdateBannerCommand)
export class UpdateBannerHandler implements ICommandHandler<UpdateBannerCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateBannerCommand) {
    const banner = await Banner.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(banner, "Banner not found");

    if (cmd.payload.title !== undefined) banner.title = cmd.payload.title;
    if (cmd.payload.subtitle !== undefined)
      banner.subtitle = cmd.payload.subtitle;
    if (cmd.payload.linkUrl !== undefined) banner.linkUrl = cmd.payload.linkUrl;
    if (cmd.payload.badgeText !== undefined)
      banner.badgeText = cmd.payload.badgeText;
    if (cmd.payload.isActive !== undefined)
      banner.isActive = cmd.payload.isActive;

    if (cmd.imagePath) {
      const oldImage = banner.imageUrl;
      banner.imageUrl = cmd.imagePath;
      if (oldImage) await deleteUploadedFile(oldImage).catch(() => {});
    }

    const saved = await banner.save();

    await Promise.all([
      this.cache.del(BANNERS_LIST_CACHE_KEY),
      this.cache.del(bannerByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(UpdateBannerResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
