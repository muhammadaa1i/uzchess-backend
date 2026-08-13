import { RemoveFavouriteHandler } from "@/features/common/favourite/commands/remove-favourite/remove-favourite.handler";
import { RemoveFavouriteCommand } from "@/features/common/favourite/commands/remove-favourite/remove-favourite.command";
import { CourseFavourite } from "@/features/common/entities/favourite/course-favourite.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("RemoveFavouriteHandler", () => {
  let handler: RemoveFavouriteHandler;

  beforeEach(() => {
    handler = new RemoveFavouriteHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the favourite row when it exists", async () => {
    const favourite: any = { courseId: 1, userId: 2 };
    const findSpy = jest.spyOn(CourseFavourite, "findOneBy").mockResolvedValue(favourite);
    const removeSpy = jest.spyOn(CourseFavourite, "remove").mockResolvedValue(favourite);

    const result = await handler.execute(new RemoveFavouriteCommand(1, 2));

    expect(findSpy).toHaveBeenCalledWith({ courseId: 1, userId: 2 });
    expect(removeSpy).toHaveBeenCalledWith(favourite);
    expect(result.message).toBe("Course removed from favourites");
  });

  it("throws DoesNotExistException (404) when the course isn't favourited by the user", async () => {
    jest.spyOn(CourseFavourite, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(CourseFavourite, "remove");

    await expect(
      handler.execute(new RemoveFavouriteCommand(1, 2)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
