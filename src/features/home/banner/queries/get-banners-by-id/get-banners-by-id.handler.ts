import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBannersByIdQuery } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.query";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { GetBannersByIdResponse } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetBannersByIdQuery)
export class GetBannersByIdHandler implements IQueryHandler<GetBannersByIdQuery> {
  async execute(query: GetBannersByIdQuery) {
    const banner = await Banner.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(banner, "Banner not found");

    return plainToInstance(GetBannersByIdResponse, banner, {
      excludeExtraneousValues: true,
    });
  }
}
