import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBannerCommand } from "@/features/home/banner/commands/create-banner/create-banner.command";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { CreateBannerResponse } from "@/features/home/banner/commands/create-banner/create-banner.response";

@CommandHandler(CreateBannerCommand)
export class CreateBannerHandler implements ICommandHandler<CreateBannerCommand> {
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

    return plainToInstance(CreateBannerResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
