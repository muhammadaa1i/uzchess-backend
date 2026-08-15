import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeletePlayerCommand } from "@/features/home/player/commands/delete-player/delete-player.command";
import { Player } from "@/features/home/entities/player/player.entity";
import { plainToInstance } from "class-transformer";
import { DeletePlayerResponse } from "@/features/home/player/commands/delete-player/delete-player.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

@CommandHandler(DeletePlayerCommand)
export class DeletePlayerHandler implements ICommandHandler<DeletePlayerCommand> {
  async execute(cmd: DeletePlayerCommand) {
    const player = await Player.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(player, "Player not found");

    await Player.remove(player);
    if (player.avatarUrl)
      await deleteUploadedFile(player.avatarUrl).catch(() => {});

    return plainToInstance(DeletePlayerResponse, {
      message: "Player deleted successfully",
    });
  }
}
