import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBannersQuery } from "@/features/home/banner/queries/get-banners/get-banners.query";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { plainToInstance } from "class-transformer";
import { GetBannersResponse } from "@/features/home/banner/queries/get-banners/get-banners.response";

@QueryHandler(GetBannersQuery)
export class GetBannersHandler implements IQueryHandler<GetBannersQuery> {
  async execute() {
    const banners = await Banner.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });

    return plainToInstance(GetBannersResponse, banners, {
      excludeExtraneousValues: true,
    });
  }
}
