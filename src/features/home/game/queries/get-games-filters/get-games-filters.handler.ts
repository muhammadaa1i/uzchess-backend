import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetGamesFiltersQuery } from "@/features/home/game/queries/get-games-filters/get-games-filters.query";
import { Game } from "@/features/home/entities/game/game.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { plainToInstance } from "class-transformer";
import { GetGamesFiltersResponse } from "@/features/home/game/queries/get-games-filters/get-games-filters.response";
import { calculateAge } from "@/features/home/game/game-age.util";

@QueryHandler(GetGamesFiltersQuery)
export class GetGamesFiltersHandler implements IQueryHandler<GetGamesFiltersQuery> {
  async execute() {
    const games = await Game.find({
      relations: { whitePlayer: true, blackPlayer: true },
    });

    const playersById = new Map<number, Player>();
    for (const game of games) {
      playersById.set(game.whitePlayer.id, game.whitePlayer);
      playersById.set(game.blackPlayer.id, game.blackPlayer);
    }
    const players = Array.from(playersById.values());

    const countries = Array.from(new Set(players.map((player) => player.country))).sort();
    const ages = Array.from(
      new Set(
        players
          .map((player) => calculateAge(player.birthDate))
          .filter((age): age is number => age !== null),
      ),
    ).sort((a, b) => a - b);

    return plainToInstance(
      GetGamesFiltersResponse,
      { countries, ages },
      { excludeExtraneousValues: true },
    );
  }
}
