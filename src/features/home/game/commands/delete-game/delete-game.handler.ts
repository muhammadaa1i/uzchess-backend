import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteGameCommand } from "@/features/home/game/commands/delete-game/delete-game.command";
import { Game } from "@/features/home/entities/game/game.entity";
import { plainToInstance } from "class-transformer";
import { DeleteGameResponse } from "@/features/home/game/commands/delete-game/delete-game.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

@CommandHandler(DeleteGameCommand)
export class DeleteGameHandler implements ICommandHandler<DeleteGameCommand> {
  async execute(cmd: DeleteGameCommand) {
    const game = await Game.findOneBy({ id: cmd.id });

    DoesNotExistException.ThrowIfNull(game, "Game not found");

    await Game.remove(game);

    return plainToInstance(DeleteGameResponse, {
      message: "Game deleted successfully",
    });
  }
}
