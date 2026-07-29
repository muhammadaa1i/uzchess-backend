import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddFavouriteCommand } from "@/features/common/favourite/commands/add-favourite/add-favourite.command";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseFavourite } from "@/features/common/entities/favourite/course-favourite.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { AddCourseFavouriteResponse } from "@/features/common/favourite/commands/add-favourite/add-favourite.response";

@CommandHandler(AddFavouriteCommand)
export class AddFavouriteHandler
  implements ICommandHandler<AddFavouriteCommand>
{
  async execute(cmd: AddFavouriteCommand) {
    const courseExists = await Course.existsBy({ id: cmd.courseId });
    DoesNotExistException.ThrowIf(!courseExists, "Course not found");

    const alreadyFavourited = await CourseFavourite.existsBy({
      courseId: cmd.courseId,
      userId: cmd.userId,
    });
    AlreadyExistException.ThrowIf(
      alreadyFavourited,
      "Course already in favourites",
    );

    const favourite = CourseFavourite.create({
      courseId: cmd.courseId,
      userId: cmd.userId,
    });
    await CourseFavourite.save(favourite);

    return plainToInstance(
      AddCourseFavouriteResponse,
      {
        courseId: cmd.courseId,
        message: "Course added to favourites",
      },
      { excludeExtraneousValues: true },
    );
  }
}
