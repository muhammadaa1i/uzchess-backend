import { GetBooksHandler } from "@/features/library/book/queries/get-books/get-books.handler";
import { GetBooksQuery } from "@/features/library/book/queries/get-books/get-books.query";
import { GetBooksRequest } from "@/features/library/book/queries/get-books/get-books.request";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";

describe("GetBooksHandler", () => {
  let handler: GetBooksHandler;
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
      bookAuthors: [],
      ...overrides,
    }) as unknown as Book;

  const mockRatingQueryBuilder = (rows: Array<{ bookId: number; average: string; count: string }>) => {
    const getRawManyMock = jest.fn().mockResolvedValue(rows);
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: getRawManyMock,
    };
    jest.spyOn(Rating, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  };

  const payload = (overrides: Partial<GetBooksRequest> = {}) =>
    ({ ...overrides }) as GetBooksRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetBooksHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached list on a default (no-filter) query when a cache hit exists", async () => {
    cache.get.mockResolvedValue({ totalCount: 1, data: [] });
    const findSpy = jest.spyOn(Book, "find");

    const result = await handler.execute(new GetBooksQuery(payload()));

    expect(result).toEqual({ totalCount: 1, data: [] });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("computes averageRating and ratingsCount per book from the rating aggregate query", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "find").mockResolvedValue([
      makeBook({ id: 1, bookAuthors: [{ authorId: 11 } as any] }),
      makeBook({ id: 2, title: "Book 2", bookAuthors: [] }),
    ]);
    mockRatingQueryBuilder([{ bookId: 1, average: "4.5", count: "3" }]);

    const result = await handler.execute(new GetBooksQuery(payload()));

    const book1 = result.data.find((b: any) => b.id === 1);
    const book2 = result.data.find((b: any) => b.id === 2);
    expect(book1.averageRating).toBe(4.5);
    expect(book1.ratingsCount).toBe(3);
    expect(book1.authorIds).toEqual([11]);
    expect(book2.averageRating).toBe(0);
    expect(book2.ratingsCount).toBe(0);
  });

  it("applies search, categoryId, difficultyId and languageId filters to the where clause", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest.spyOn(Book, "find").mockResolvedValue([]);
    mockRatingQueryBuilder([]);

    await handler.execute(
      new GetBooksQuery(
        payload({ search: "chess", categoryId: 2, difficultyId: 3, languageId: 4 }),
      ),
    );

    const callArgs = findSpy.mock.calls[0][0] as any;
    expect(callArgs.where.categoryId).toBe(2);
    expect(callArgs.where.difficultyId).toBe(3);
    expect(callArgs.where.languageId).toBe(4);
    expect(callArgs.where.title).toBeDefined();
  });

  it("filters out books below minRating after computing aggregates", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "find").mockResolvedValue([
      makeBook({ id: 1 }),
      makeBook({ id: 2 }),
    ]);
    mockRatingQueryBuilder([
      { bookId: 1, average: "4.8", count: "5" },
      { bookId: 2, average: "2.0", count: "2" },
    ]);

    const result = await handler.execute(
      new GetBooksQuery(payload({ minRating: 4 })),
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);
    expect(result.totalCount).toBe(1);
  });

  it("paginates using page/size and reports totalPages/hasNext/hasPrevious correctly", async () => {
    cache.get.mockResolvedValue(undefined);
    const books = [1, 2, 3, 4, 5].map((id) => makeBook({ id }));
    jest.spyOn(Book, "find").mockResolvedValue(books);
    mockRatingQueryBuilder([]);

    const result = await handler.execute(
      new GetBooksQuery(payload({ page: 2, size: 2 })),
    );

    expect(result.data).toHaveLength(2);
    expect(result.data.map((b: any) => b.id)).toEqual([3, 4]);
    expect(result.totalCount).toBe(5);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(2);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
  });

  it("skips the rating query entirely when there are no books", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "find").mockResolvedValue([]);
    const ratingSpy = jest.spyOn(Rating, "createQueryBuilder");

    const result = await handler.execute(new GetBooksQuery(payload()));

    expect(ratingSpy).not.toHaveBeenCalled();
    expect(result.data).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it("caches the result only for the default (no-filter) query", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "find").mockResolvedValue([]);
    jest.spyOn(Rating, "createQueryBuilder");

    await handler.execute(new GetBooksQuery(payload({ search: "chess" })));
    expect(cache.set).not.toHaveBeenCalled();

    jest.clearAllMocks();
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "find").mockResolvedValue([]);

    await handler.execute(new GetBooksQuery(payload()));
    expect(cache.set).toHaveBeenCalledWith("books:list", expect.any(Object));
  });
});
