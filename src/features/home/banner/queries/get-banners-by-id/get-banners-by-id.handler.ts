import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBannersByIdQuery } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.query";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { GetBannersByIdResponse } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { bannerByIdCacheKey } from "@/features/home/banner/banner.cache";

@QueryHandler(GetBannersByIdQuery)
export class GetBannersByIdHandler implements IQueryHandler<GetBannersByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetBannersByIdQuery) {
    const cacheKey = bannerByIdCacheKey(query.id);
    const cached = await this.cache.get<GetBannersByIdResponse>(cacheKey);
    if (cached) return cached;

    const banner = await Banner.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(banner, "Banner not found");

    const result = plainToInstance(GetBannersByIdResponse, banner, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
