import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { GameController } from "@/features/home/game/game.controller";
import { CreateGameHandler } from "@/features/home/game/commands/create-game/create-game.handler";
import { UpdateGameHandler } from "@/features/home/game/commands/update-game/update-game.handler";
import { DeleteGameHandler } from "@/features/home/game/commands/delete-game/delete-game.handler";
import { GetGamesHandler } from "@/features/home/game/queries/get-games/get-games.handler";
import { GetGamesByIdHandler } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.handler";
import { GetGamesListHandler } from "@/features/home/game/queries/get-games-list/get-games-list.handler";
import { GetGamesFiltersHandler } from "@/features/home/game/queries/get-games-filters/get-games-filters.handler";

@Module({
  imports: [CqrsModule],
  controllers: [GameController],
  providers: [
    GetGamesHandler,
    GetGamesByIdHandler,
    GetGamesListHandler,
    GetGamesFiltersHandler,
    CreateGameHandler,
    UpdateGameHandler,
    DeleteGameHandler,
  ],
})
export class GameModule {}
