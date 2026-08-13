import { GetBooksByIdHandler } from "@/features/library/book/queries/get-books-by-id/get-books-by-id.handler";
import { GetBooksByIdQuery } from "@/features/library/book/queries/get-books-by-id/get-books-by-id.query";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetBooksByIdHandler", () => {
  let handler: GetBooksByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeBook = (overrides: Partial<Book> = {}) =>
    ({
      id: 1,
      title: "Book",
      price: 100,
      discountPrice: null,
      cover: "cover.png",
      description: "desc",
      pageCount: 100,
      publishedYear: 2020,
      categoryId: 1,
      difficultyId: 1,
      languageId: 1,
      bookAuthors: [{ authorId: 11 }, { authorId: 12 }],
      ...overrides,
    }) as unknown as Book;

  const mockRatingQueryBuilder = (raw: { average: string | null; count: string } | null) => {
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(raw),
    };
    jest.spyOn(Rating, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetBooksByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue({ id: 1, title: "Cached" });
    const findSpy = jest.spyOn(Book, "findOne");

    const result = await handler.execute(new GetBooksByIdQuery(1));

    expect(result).toEqual({ id: 1, title: "Cached" });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the book doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new GetBooksByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("computes averageRating and ratingsCount from the rating aggregate query", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "findOne").mockResolvedValue(makeBook());
    mockRatingQueryBuilder({ average: "3.666", count: "3" });

    const result = await handler.execute(new GetBooksByIdQuery(1));

    expect(result.averageRating).toBe(3.7);
    expect(result.ratingsCount).toBe(3);
    expect(result.authorIds).toEqual([11, 12]);
  });

  it("defaults averageRating and ratingsCount to 0 when the book has no ratings", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "findOne").mockResolvedValue(makeBook());
    mockRatingQueryBuilder({ average: null, count: "0" });

    const result = await handler.execute(new GetBooksByIdQuery(1));

    expect(result.averageRating).toBe(0);
    expect(result.ratingsCount).toBe(0);
  });

  it("caches the computed result under the book-by-id cache key", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "findOne").mockResolvedValue(makeBook({ id: 7 }));
    mockRatingQueryBuilder({ average: "5", count: "1" });

    await handler.execute(new GetBooksByIdQuery(7));

    expect(cache.set).toHaveBeenCalledWith("books:7", expect.any(Object));
  });
});
