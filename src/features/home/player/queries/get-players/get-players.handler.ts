import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPlayersQuery } from "@/features/home/player/queries/get-players/get-players.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { plainToInstance } from "class-transformer";
import { GetPlayersResponse } from "@/features/home/player/queries/get-players/get-players.response";
import { Cache } from "@nestjs/cache-manager";
import { PLAYERS_TOP_CACHE_KEY } from "@/features/home/player/player.cache";

@QueryHandler(GetPlayersQuery)
export class GetPlayersHandler implements IQueryHandler<GetPlayersQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetPlayersQuery) {
    const isDefaultQuery = query.payload.limit === undefined;

    if (isDefaultQuery) {
      const cached = await this.cache.get<GetPlayersResponse[]>(
        PLAYERS_TOP_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const players = await Player.find({
      order: { classicalRating: "DESC" },
      take: query.payload.limit ?? 5,
    });

    const result = plainToInstance(GetPlayersResponse, players, {
      excludeExtraneousValues: true,
    });

    if (isDefaultQuery) await this.cache.set(PLAYERS_TOP_CACHE_KEY, result);

    return result;
  }
}
