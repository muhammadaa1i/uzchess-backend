import { AddFavouriteHandler } from "@/features/common/favourite/commands/add-favourite/add-favourite.handler";
import { AddFavouriteCommand } from "@/features/common/favourite/commands/add-favourite/add-favourite.command";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseFavourite } from "@/features/common/entities/favourite/course-favourite.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";

describe("AddFavouriteHandler", () => {
  let handler: AddFavouriteHandler;

  beforeEach(() => {
    handler = new AddFavouriteHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const existsSpy = jest.spyOn(CourseFavourite, "existsBy");
    const saveSpy = jest.spyOn(CourseFavourite, "save");

    await expect(
      handler.execute(new AddFavouriteCommand(99, 1)),
    ).rejects.toBeInstanceOf(DoesNotExistException);

    expect(existsSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when the course is already favourited by the user", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(CourseFavourite, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(CourseFavourite, "create");
    const saveSpy = jest.spyOn(CourseFavourite, "save");

    await expect(
      handler.execute(new AddFavouriteCommand(1, 2)),
    ).rejects.toBeInstanceOf(AlreadyExistException);

    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("creates a favourite row when the course exists and isn't already favourited", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(CourseFavourite, "existsBy").mockResolvedValue(false);
    const favouriteEntity: any = { courseId: 1, userId: 2 };
    const createSpy = jest.spyOn(CourseFavourite, "create").mockReturnValue(favouriteEntity);
    const saveSpy = jest.spyOn(CourseFavourite, "save").mockResolvedValue(favouriteEntity);

    const result = await handler.execute(new AddFavouriteCommand(1, 2));

    expect(createSpy).toHaveBeenCalledWith({ courseId: 1, userId: 2 });
    expect(saveSpy).toHaveBeenCalledWith(favouriteEntity);
    expect(result.courseId).toBe(1);
    expect(result.message).toBe("Course added to favourites");
  });
});
