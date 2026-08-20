import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBannerCommand } from "@/features/home/banner/commands/create-banner/create-banner.command";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { CreateBannerResponse } from "@/features/home/banner/commands/create-banner/create-banner.response";
import { Cache } from "@nestjs/cache-manager";
import { BANNERS_LIST_CACHE_KEY } from "@/features/home/banner/banner.cache";

@CommandHandler(CreateBannerCommand)
export class CreateBannerHandler implements ICommandHandler<CreateBannerCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateBannerCommand) {
    const banner = Banner.create({
      title: cmd.payload.title,
      subtitle: cmd.payload.subtitle ?? null,
      imageUrl: cmd.imagePath ?? null,
      linkUrl: cmd.payload.linkUrl ?? null,
      badgeText: cmd.payload.badgeText ?? null,
      isActive: cmd.payload.isActive ?? true,
    });
    const saved = await Banner.save(banner);

    await this.cache.del(BANNERS_LIST_CACHE_KEY);

    return plainToInstance(CreateBannerResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
