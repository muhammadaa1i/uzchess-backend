import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteGameOfDayCommand } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.command";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { plainToInstance } from "class-transformer";
import { DeleteGameOfDayResponse } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

@CommandHandler(DeleteGameOfDayCommand)
export class DeleteGameOfDayHandler implements ICommandHandler<DeleteGameOfDayCommand> {
  async execute(cmd: DeleteGameOfDayCommand) {
    const gameOfDay = await GameOfDay.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(gameOfDay, "Game of the day not found");

    await GameOfDay.remove(gameOfDay);
    await deleteUploadedFile(gameOfDay.videoUrl).catch(() => {});
    await deleteUploadedFile(gameOfDay.thumbnailUrl).catch(() => {});

    return plainToInstance(DeleteGameOfDayResponse, {
      message: "Game of the day deleted successfully",
    });
  }
}
