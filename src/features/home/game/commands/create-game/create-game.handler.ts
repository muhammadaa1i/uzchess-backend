import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateGameCommand } from "@/features/home/game/commands/create-game/create-game.command";
import { Game } from "@/features/home/entities/game/game.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateGameResponse } from "@/features/home/game/commands/create-game/create-game.response";

@CommandHandler(CreateGameCommand)
export class CreateGameHandler implements ICommandHandler<CreateGameCommand> {
  async execute(cmd: CreateGameCommand) {
    const whitePlayerExists = await Player.existsBy({
      id: cmd.payload.whitePlayerId,
    });
    DoesNotExistException.ThrowIf(!whitePlayerExists, "White player not found");

    const blackPlayerExists = await Player.existsBy({
      id: cmd.payload.blackPlayerId,
    });
    DoesNotExistException.ThrowIf(!blackPlayerExists, "Black player not found");

    const game = Game.create({
      whitePlayerId: cmd.payload.whitePlayerId,
      blackPlayerId: cmd.payload.blackPlayerId,
      whiteScore: cmd.payload.whiteScore,
      blackScore: cmd.payload.blackScore,
      gameType: cmd.payload.gameType,
      movesCount: cmd.payload.movesCount,
      playedAt: new Date(cmd.payload.playedAt),
    });
    const saved = await Game.save(game);

    return plainToInstance(CreateGameResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
