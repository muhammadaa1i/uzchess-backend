import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPlayersQuery } from "@/features/home/player/queries/get-players/get-players.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { plainToInstance } from "class-transformer";
import { GetPlayersResponse } from "@/features/home/player/queries/get-players/get-players.response";

@QueryHandler(GetPlayersQuery)
export class GetPlayersHandler implements IQueryHandler<GetPlayersQuery> {
  async execute(query: GetPlayersQuery) {
    const players = await Player.find({
      order: { classicalRating: "DESC" },
      take: query.payload.limit ?? 5,
    });

    return plainToInstance(GetPlayersResponse, players, {
      excludeExtraneousValues: true,
    });
  }
}
