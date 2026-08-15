import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePlayerCommand } from "@/features/home/player/commands/create-player/create-player.command";
import { Player } from "@/features/home/entities/player/player.entity";
import { plainToInstance } from "class-transformer";
import { CreatePlayerResponse } from "@/features/home/player/commands/create-player/create-player.response";
import { PlayerTitle } from "@/core/enums/player-title.enum";

@CommandHandler(CreatePlayerCommand)
export class CreatePlayerHandler implements ICommandHandler<CreatePlayerCommand> {
  async execute(cmd: CreatePlayerCommand) {
    const player = Player.create({
      name: cmd.payload.name,
      avatarUrl: cmd.avatarPath ?? null,
      country: cmd.payload.country,
      title: cmd.payload.title ?? PlayerTitle.None,
      classicalRating: cmd.payload.classicalRating,
      classicalRatingChange: cmd.payload.classicalRatingChange ?? null,
      rapidRating: cmd.payload.rapidRating,
      rapidRatingChange: cmd.payload.rapidRatingChange ?? null,
      blitzRating: cmd.payload.blitzRating,
      blitzRatingChange: cmd.payload.blitzRatingChange ?? null,
      rankChange: cmd.payload.rankChange ?? null,
    });
    const saved = await Player.save(player);

    return plainToInstance(CreatePlayerResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
