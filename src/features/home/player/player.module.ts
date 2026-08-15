import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PlayerController } from "@/features/home/player/player.controller";
import { CreatePlayerHandler } from "@/features/home/player/commands/create-player/create-player.handler";
import { UpdatePlayerHandler } from "@/features/home/player/commands/update-player/update-player.handler";
import { DeletePlayerHandler } from "@/features/home/player/commands/delete-player/delete-player.handler";
import { GetPlayersHandler } from "@/features/home/player/queries/get-players/get-players.handler";
import { GetPlayersByIdHandler } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.handler";
import { GetPlayersRankingHandler } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.handler";
import { GetRankingFiltersHandler } from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.handler";

@Module({
  imports: [CqrsModule],
  controllers: [PlayerController],
  providers: [
    GetPlayersHandler,
    GetPlayersByIdHandler,
    GetPlayersRankingHandler,
    GetRankingFiltersHandler,
    CreatePlayerHandler,
    UpdatePlayerHandler,
    DeletePlayerHandler,
  ],
})
export class PlayerModule {}
