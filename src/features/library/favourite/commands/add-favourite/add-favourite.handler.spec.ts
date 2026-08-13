import { AddFavouriteHandler } from "@/features/library/favourite/commands/add-favourite/add-favourite.handler";
import { AddFavouriteCommand } from "@/features/library/favourite/commands/add-favourite/add-favourite.command";
import { Book } from "@/features/library/entities/book/book.entity";
import { Favourite } from "@/features/library/entities/favourite/favourite.entity";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("AddFavouriteHandler", () => {
  let handler: AddFavouriteHandler;

  beforeEach(() => {
    handler = new AddFavouriteHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a favourite on the happy path", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    jest.spyOn(Favourite, "existsBy").mockResolvedValue(false);
    const createSpy = jest
      .spyOn(Favourite, "create")
      .mockReturnValue({ bookId: 1, userId: 2 } as any);
    const saveSpy = jest.spyOn(Favourite, "save").mockResolvedValue({} as any);

    const result = await handler.execute(new AddFavouriteCommand(1, 2));

    expect(createSpy).toHaveBeenCalledWith({ bookId: 1, userId: 2 });
    expect(saveSpy).toHaveBeenCalled();
    expect(result).toEqual({ bookId: 1, message: "Book added to favourites" });
  });

  it("throws AlreadyExistException (409) when the book is already favourited", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    jest.spyOn(Favourite, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(Favourite, "create");
    const saveSpy = jest.spyOn(Favourite, "save");

    await expect(handler.execute(new AddFavouriteCommand(1, 2))).rejects.toBeInstanceOf(
      AlreadyExistException,
    );
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the book doesn't exist", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    const existsBySpy = jest.spyOn(Favourite, "existsBy");

    await expect(handler.execute(new AddFavouriteCommand(1, 2))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(existsBySpy).not.toHaveBeenCalled();
  });
});
