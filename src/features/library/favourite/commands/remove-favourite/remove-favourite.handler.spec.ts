import { RemoveFavouriteHandler } from "@/features/library/favourite/commands/remove-favourite/remove-favourite.handler";
import { RemoveFavouriteCommand } from "@/features/library/favourite/commands/remove-favourite/remove-favourite.command";
import { Favourite } from "@/features/library/entities/favourite/favourite.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("RemoveFavouriteHandler", () => {
  let handler: RemoveFavouriteHandler;

  beforeEach(() => {
    handler = new RemoveFavouriteHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the favourite on the happy path", async () => {
    const favourite = { bookId: 1, userId: 2 };
    jest.spyOn(Favourite, "findOneBy").mockResolvedValue(favourite as any);
    const removeSpy = jest.spyOn(Favourite, "remove").mockResolvedValue(favourite as any);

    const result = await handler.execute(new RemoveFavouriteCommand(1, 2));

    expect(removeSpy).toHaveBeenCalledWith(favourite);
    expect(result).toEqual({ message: "Book removed from favourites" });
  });

  it("throws DoesNotExistException (404) when the book isn't favourited", async () => {
    jest.spyOn(Favourite, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Favourite, "remove");

    await expect(handler.execute(new RemoveFavouriteCommand(1, 2))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
