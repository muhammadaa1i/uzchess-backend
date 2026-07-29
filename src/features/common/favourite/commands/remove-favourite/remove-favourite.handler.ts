import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveFavouriteCommand } from "@/features/common/favourite/commands/remove-favourite/remove-favourite.command";
import { CourseFavourite } from "@/features/common/entities/favourite/course-favourite.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { RemoveCourseFavouriteResponse } from "@/features/common/favourite/commands/remove-favourite/remove-favourite.response";

@CommandHandler(RemoveFavouriteCommand)
export class RemoveFavouriteHandler
  implements ICommandHandler<RemoveFavouriteCommand>
{
  async execute(cmd: RemoveFavouriteCommand) {
    const favourite = await CourseFavourite.findOneBy({
      courseId: cmd.courseId,
      userId: cmd.userId,
    });
    DoesNotExistException.ThrowIfNull(favourite, "Favourite not found");

    await CourseFavourite.remove(favourite);

    return plainToInstance(RemoveCourseFavouriteResponse, {
      message: "Course removed from favourites",
    });
  }
}
