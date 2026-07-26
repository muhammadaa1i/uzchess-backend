import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetDifficultiesByIdQuery } from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.query";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { GetDifficultiesByIdResponse } from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.response";
import { Cache } from "@nestjs/cache-manager";
import { difficultyByIdCacheKey } from "@/features/library/difficulty/difficulty.cache";

@QueryHandler(GetDifficultiesByIdQuery)
export class GetDifficultiesByIdHandler implements IQueryHandler<GetDifficultiesByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetDifficultiesByIdQuery) {
    const cacheKey = difficultyByIdCacheKey(query.id);
    const cached = await this.cache.get<GetDifficultiesByIdResponse>(cacheKey);
    if (cached) return cached;

    const difficulty = await Difficulty.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(difficulty, "Difficulty not found");

    const result = plainToInstance(GetDifficultiesByIdResponse, difficulty, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
