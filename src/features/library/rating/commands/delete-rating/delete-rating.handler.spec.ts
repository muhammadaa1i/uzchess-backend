import { DeleteRatingHandler } from "@/features/library/rating/commands/delete-rating/delete-rating.handler";
import { DeleteRatingCommand } from "@/features/library/rating/commands/delete-rating/delete-rating.command";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("DeleteRatingHandler", () => {
  let handler: DeleteRatingHandler;
  let cache: { del: jest.Mock };

  beforeEach(() => {
    cache = { del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteRatingHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the rating on the happy path", async () => {
    const rating = { bookId: 1, userId: 2 };
    jest.spyOn(Rating, "findOneBy").mockResolvedValue(rating as any);
    const removeSpy = jest.spyOn(Rating, "remove").mockResolvedValue(rating as any);

    const result = await handler.execute(new DeleteRatingCommand(1, 2));

    expect(removeSpy).toHaveBeenCalledWith(rating);
    expect(result).toEqual({ message: "Rating deleted successfully" });
  });

  it("invalidates the books list and book-by-id cache keys", async () => {
    const rating = { bookId: 1, userId: 2 };
    jest.spyOn(Rating, "findOneBy").mockResolvedValue(rating as any);
    jest.spyOn(Rating, "remove").mockResolvedValue(rating as any);

    await handler.execute(new DeleteRatingCommand(1, 2));

    expect(cache.del).toHaveBeenCalledWith("books:list");
    expect(cache.del).toHaveBeenCalledWith("books:1");
  });

  it("throws DoesNotExistException (404) when the rating doesn't exist", async () => {
    jest.spyOn(Rating, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Rating, "remove");

    await expect(handler.execute(new DeleteRatingCommand(1, 2))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
