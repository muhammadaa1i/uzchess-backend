import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPlayersByIdQuery } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { plainToInstance } from "class-transformer";
import { GetPlayersByIdResponse } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { playerByIdCacheKey } from "@/features/home/player/player.cache";

@QueryHandler(GetPlayersByIdQuery)
export class GetPlayersByIdHandler implements IQueryHandler<GetPlayersByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetPlayersByIdQuery) {
    const cacheKey = playerByIdCacheKey(query.id);
    const cached = await this.cache.get<GetPlayersByIdResponse>(cacheKey);
    if (cached) return cached;

    const player = await Player.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(player, "Player not found");

    const result = plainToInstance(GetPlayersByIdResponse, player, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
