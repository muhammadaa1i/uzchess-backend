import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { GameOfDayController } from "@/features/home/game-of-day/game-of-day.controller";
import { CreateGameOfDayHandler } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.handler";
import { UpdateGameOfDayHandler } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.handler";
import { DeleteGameOfDayHandler } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.handler";
import { GetGameOfDaysHandler } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.handler";
import { GetGameOfDaysByIdHandler } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.handler";
import { GetActiveGameOfDayHandler } from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.handler";

@Module({
  imports: [CqrsModule],
  controllers: [GameOfDayController],
  providers: [
    GetGameOfDaysHandler,
    GetGameOfDaysByIdHandler,
    GetActiveGameOfDayHandler,
    CreateGameOfDayHandler,
    UpdateGameOfDayHandler,
    DeleteGameOfDayHandler,
  ],
})
export class GameOfDayModule {}
