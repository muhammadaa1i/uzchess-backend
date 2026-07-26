import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveFavouriteCommand } from "@/features/library/favourite/commands/remove-favourite/remove-favourite.command";
import { Favourite } from "@/features/library/entities/favourite/favourite.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { RemoveFavouriteResponse } from "@/features/library/favourite/commands/remove-favourite/remove-favourite.response";

@CommandHandler(RemoveFavouriteCommand)
export class RemoveFavouriteHandler implements ICommandHandler<RemoveFavouriteCommand> {
  async execute(cmd: RemoveFavouriteCommand) {
    const favourite = await Favourite.findOneBy({
      bookId: cmd.bookId,
      userId: cmd.userId,
    });
    DoesNotExistException.ThrowIfNull(favourite, "Favourite not found");

    await Favourite.remove(favourite);

    return plainToInstance(RemoveFavouriteResponse, {
      message: "Book removed from favourites",
    });
  }
}
