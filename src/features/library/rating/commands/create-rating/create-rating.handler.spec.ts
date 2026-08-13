import { CreateRatingHandler } from "@/features/library/rating/commands/create-rating/create-rating.handler";
import { CreateRatingCommand } from "@/features/library/rating/commands/create-rating/create-rating.command";
import { CreateRatingRequest } from "@/features/library/rating/commands/create-rating/create-rating.request";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("CreateRatingHandler", () => {
  let handler: CreateRatingHandler;
  let cache: { del: jest.Mock };

  beforeEach(() => {
    cache = { del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateRatingHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  function mockRatingAggregate(average: string | null, count: string) {
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ average, count }),
    };
    jest.spyOn(Rating, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  }

  it("upserts in place: updates and saves the existing rating instead of creating a new one", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    const existingRating = { bookId: 1, userId: 2, score: 3 };
    jest.spyOn(Rating, "findOneBy").mockResolvedValue(existingRating as any);
    const createSpy = jest.spyOn(Rating, "create");
    const saveSpy = jest.spyOn(Rating, "save").mockResolvedValue(existingRating as any);
    mockRatingAggregate("5", "1");

    const request: CreateRatingRequest = { score: 5 };
    const result = await handler.execute(new CreateRatingCommand(1, 2, request));

    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ bookId: 1, userId: 2, score: 5 }),
    );
    expect(existingRating.score).toBe(5);
    expect(result.bookId).toBe(1);
    expect(result.score).toBe(5);
  });

  it("creates a new rating when none exists yet for this book+user", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    jest.spyOn(Rating, "findOneBy").mockResolvedValue(null);
    const createSpy = jest
      .spyOn(Rating, "create")
      .mockReturnValue({ bookId: 1, userId: 2, score: 4 } as any);
    const saveSpy = jest.spyOn(Rating, "save").mockResolvedValue({} as any);
    mockRatingAggregate("4", "1");

    const request: CreateRatingRequest = { score: 4 };
    const result = await handler.execute(new CreateRatingCommand(1, 2, request));

    expect(createSpy).toHaveBeenCalledWith({ bookId: 1, userId: 2, score: 4 });
    expect(saveSpy).toHaveBeenCalled();
    expect(result.averageRating).toBe(4);
    expect(result.ratingsCount).toBe(1);
  });

  it("returns averageRating 0 and ratingsCount 0 when the aggregate query yields no rows", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    jest.spyOn(Rating, "findOneBy").mockResolvedValue(null);
    jest.spyOn(Rating, "create").mockReturnValue({ bookId: 1, userId: 2, score: 4 } as any);
    jest.spyOn(Rating, "save").mockResolvedValue({} as any);
    mockRatingAggregate(null, "0");

    const request: CreateRatingRequest = { score: 4 };
    const result = await handler.execute(new CreateRatingCommand(1, 2, request));

    expect(result.averageRating).toBe(0);
    expect(result.ratingsCount).toBe(0);
  });

  it("throws DoesNotExistException (404) when the book doesn't exist", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    const findOneBySpy = jest.spyOn(Rating, "findOneBy");
    const saveSpy = jest.spyOn(Rating, "save");

    const request: CreateRatingRequest = { score: 4 };
    await expect(
      handler.execute(new CreateRatingCommand(1, 2, request)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(findOneBySpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("invalidates the books list and book-by-id cache keys", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    jest.spyOn(Rating, "findOneBy").mockResolvedValue(null);
    jest.spyOn(Rating, "create").mockReturnValue({ bookId: 1, userId: 2, score: 4 } as any);
    jest.spyOn(Rating, "save").mockResolvedValue({} as any);
    mockRatingAggregate("4", "1");

    const request: CreateRatingRequest = { score: 4 };
    await handler.execute(new CreateRatingCommand(1, 2, request));

    expect(cache.del).toHaveBeenCalledWith("books:list");
    expect(cache.del).toHaveBeenCalledWith("books:1");
  });
});
