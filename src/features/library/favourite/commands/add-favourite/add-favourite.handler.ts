import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddFavouriteCommand } from "@/features/library/favourite/commands/add-favourite/add-favourite.command";
import { Book } from "@/features/library/entities/book/book.entity";
import { Favourite } from "@/features/library/entities/favourite/favourite.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { AddFavouriteResponse } from "@/features/library/favourite/commands/add-favourite/add-favourite.response";

@CommandHandler(AddFavouriteCommand)
export class AddFavouriteHandler implements ICommandHandler<AddFavouriteCommand> {
  async execute(cmd: AddFavouriteCommand) {
    const bookExists = await Book.existsBy({ id: cmd.bookId });
    DoesNotExistException.ThrowIf(!bookExists, "Book not found");

    const alreadyFavourited = await Favourite.existsBy({
      bookId: cmd.bookId,
      userId: cmd.userId,
    });
    AlreadyExistException.ThrowIf(
      alreadyFavourited,
      "Book already in favourites",
    );

    const favourite = Favourite.create({
      bookId: cmd.bookId,
      userId: cmd.userId,
    });
    await Favourite.save(favourite);

    return plainToInstance(
      AddFavouriteResponse,
      {
        bookId: cmd.bookId,
        message: "Book added to favourites",
      },
      { excludeExtraneousValues: true },
    );
  }
}
