import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetPlayersByIdQuery } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { plainToInstance } from "class-transformer";
import { GetPlayersByIdResponse } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetPlayersByIdQuery)
export class GetPlayersByIdHandler implements IQueryHandler<GetPlayersByIdQuery> {
  async execute(query: GetPlayersByIdQuery) {
    const player = await Player.findOneBy({ id: query.id });

    DoesNotExistException.ThrowIfNull(player, "Player not found");

    return plainToInstance(GetPlayersByIdResponse, player, {
      excludeExtraneousValues: true,
    });
  }
}
