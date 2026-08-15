import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdatePlayerCommand } from "@/features/home/player/commands/update-player/update-player.command";
import { Player } from "@/features/home/entities/player/player.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdatePlayerResponse } from "@/features/home/player/commands/update-player/update-player.response";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

@CommandHandler(UpdatePlayerCommand)
export class UpdatePlayerHandler implements ICommandHandler<UpdatePlayerCommand> {
  async execute(cmd: UpdatePlayerCommand) {
    const player = await Player.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(player, "Player not found");

    if (cmd.payload.name !== undefined) player.name = cmd.payload.name;
    if (cmd.payload.country !== undefined)
      player.country = cmd.payload.country;
    if (cmd.payload.title !== undefined) player.title = cmd.payload.title;
    if (cmd.payload.classicalRating !== undefined)
      player.classicalRating = cmd.payload.classicalRating;
    if (cmd.payload.classicalRatingChange !== undefined)
      player.classicalRatingChange = cmd.payload.classicalRatingChange;
    if (cmd.payload.rapidRating !== undefined)
      player.rapidRating = cmd.payload.rapidRating;
    if (cmd.payload.rapidRatingChange !== undefined)
      player.rapidRatingChange = cmd.payload.rapidRatingChange;
    if (cmd.payload.blitzRating !== undefined)
      player.blitzRating = cmd.payload.blitzRating;
    if (cmd.payload.blitzRatingChange !== undefined)
      player.blitzRatingChange = cmd.payload.blitzRatingChange;
    if (cmd.payload.rankChange !== undefined)
      player.rankChange = cmd.payload.rankChange;

    if (cmd.avatarPath) {
      const oldAvatar = player.avatarUrl;
      player.avatarUrl = cmd.avatarPath;
      if (oldAvatar) await deleteUploadedFile(oldAvatar).catch(() => {});
    }

    const saved = await player.save();

    return plainToInstance(UpdatePlayerResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
