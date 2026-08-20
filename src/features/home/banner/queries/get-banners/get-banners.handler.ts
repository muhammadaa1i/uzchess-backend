import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBannersQuery } from "@/features/home/banner/queries/get-banners/get-banners.query";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { GetBannersResponse } from "@/features/home/banner/queries/get-banners/get-banners.response";
import { Cache } from "@nestjs/cache-manager";
import { BANNERS_LIST_CACHE_KEY } from "@/features/home/banner/banner.cache";

@QueryHandler(GetBannersQuery)
export class GetBannersHandler implements IQueryHandler<GetBannersQuery> {
  constructor(private readonly cache: Cache) {}

  async execute() {
    const cached = await this.cache.get<GetBannersResponse[]>(
      BANNERS_LIST_CACHE_KEY,
    );
    if (cached) return cached;

    const banners = await Banner.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });

    const result = plainToInstance(GetBannersResponse, banners, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(BANNERS_LIST_CACHE_KEY, result);

    return result;
  }
}
