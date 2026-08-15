import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BannerController } from "@/features/home/banner/banner.controller";
import { CreateBannerHandler } from "@/features/home/banner/commands/create-banner/create-banner.handler";
import { UpdateBannerHandler } from "@/features/home/banner/commands/update-banner/update-banner.handler";
import { DeleteBannerHandler } from "@/features/home/banner/commands/delete-banner/delete-banner.handler";
import { GetBannersHandler } from "@/features/home/banner/queries/get-banners/get-banners.handler";
import { GetBannersByIdHandler } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.handler";

@Module({
  imports: [CqrsModule],
  controllers: [BannerController],
  providers: [
    GetBannersHandler,
    GetBannersByIdHandler,
    CreateBannerHandler,
    UpdateBannerHandler,
    DeleteBannerHandler,
  ],
})
export class BannerModule {}
