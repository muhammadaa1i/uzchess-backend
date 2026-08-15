import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateGameOfDayCommand } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.command";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateGameOfDayResponse } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.response";

@CommandHandler(CreateGameOfDayCommand)
export class CreateGameOfDayHandler implements ICommandHandler<CreateGameOfDayCommand> {
  async execute(cmd: CreateGameOfDayCommand) {
    const whitePlayerExists = await Player.existsBy({
      id: cmd.payload.whitePlayerId,
    });
    DoesNotExistException.ThrowIf(!whitePlayerExists, "White player not found");

    const blackPlayerExists = await Player.existsBy({
      id: cmd.payload.blackPlayerId,
    });
    DoesNotExistException.ThrowIf(!blackPlayerExists, "Black player not found");

    const isActive = cmd.payload.isActive ?? false;
    if (isActive) {
      await GameOfDay.update({ isActive: true }, { isActive: false });
    }

    const gameOfDay = GameOfDay.create({
      videoUrl: cmd.videoPath,
      thumbnailUrl: cmd.thumbnailPath,
      durationSeconds: cmd.payload.durationSeconds,
      liveStartTime: new Date(cmd.payload.liveStartTime),
      gameType: cmd.payload.gameType,
      whitePlayerId: cmd.payload.whitePlayerId,
      blackPlayerId: cmd.payload.blackPlayerId,
      isActive,
    });
    const saved = await GameOfDay.save(gameOfDay);

    return plainToInstance(CreateGameOfDayResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
