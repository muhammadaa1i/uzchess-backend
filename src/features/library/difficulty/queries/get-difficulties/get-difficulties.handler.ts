import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetDifficultiesQuery } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.query";
import { FindOptionsWhere, ILike } from "typeorm";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { plainToInstance } from "class-transformer";
import { GetDifficultiesResponse } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.response";
import { Cache } from "@nestjs/cache-manager";
import { DIFFICULTIES_LIST_CACHE_KEY } from "@/features/library/difficulty/difficulty.cache";

@QueryHandler(GetDifficultiesQuery)
export class GetDifficultiesHandler implements IQueryHandler<GetDifficultiesQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetDifficultiesQuery) {
    if (!query.search) {
      const cached = await this.cache.get<GetDifficultiesResponse[]>(
        DIFFICULTIES_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const where: FindOptionsWhere<Difficulty> = {};
    if (query.search) where.degree = ILike(`%${query.search}%`);

    const difficulties = await Difficulty.find({ where });
    const result = plainToInstance(GetDifficultiesResponse, difficulties, {
      excludeExtraneousValues: true,
    });

    if (!query.search)
      await this.cache.set(DIFFICULTIES_LIST_CACHE_KEY, result);

    return result;
  }
}
