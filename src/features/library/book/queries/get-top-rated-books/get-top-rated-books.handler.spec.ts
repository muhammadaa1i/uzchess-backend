import { GetTopRatedBooksHandler } from "@/features/library/book/queries/get-top-rated-books/get-top-rated-books.handler";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { TOP_RATED_BOOKS_CACHE_KEY } from "@/features/library/book/book.cache";

describe("GetTopRatedBooksHandler", () => {
  let handler: GetTopRatedBooksHandler;
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

  const mockRatingQueryBuilder = (
    rows: Array<{ bookId: number; average: string; count: string }>,
  ) => {
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(rows),
    };
    jest.spyOn(Rating, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  };

  const mockPurchaseQueryBuilder = (
    rows: Array<{ bookId: number; quantity: string }>,
  ) => {
    const queryBuilder: any = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(rows),
    };
    jest.spyOn(OrderItem, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetTopRatedBooksHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached list when a cache hit exists and skips querying books", async () => {
    const cached = [{ id: 1 }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Book, "find");

    const result = await handler.execute();

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("sorts books by computed averageRating descending", async () => {
    cache.get.mockResolvedValue(undefined);
    jest
      .spyOn(Book, "find")
      .mockResolvedValue([
        makeBook({ id: 1 }),
        makeBook({ id: 2 }),
        makeBook({ id: 3 }),
      ]);
    mockRatingQueryBuilder([
      { bookId: 1, average: "3.0", count: "2" },
      { bookId: 2, average: "4.8", count: "5" },
    ]);
    mockPurchaseQueryBuilder([]);

    const result = await handler.execute();

    expect(result.map((b) => b.id)).toEqual([2, 1, 3]);
  });

  it("sorts books with zero ratings last, not erroring on a missing average", async () => {
    cache.get.mockResolvedValue(undefined);
    jest
      .spyOn(Book, "find")
      .mockResolvedValue([makeBook({ id: 1 }), makeBook({ id: 2 })]);
    mockRatingQueryBuilder([{ bookId: 2, average: "4.0", count: "1" }]);
    mockPurchaseQueryBuilder([]);

    const result = await handler.execute();

    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
    expect(result[1].averageRating).toBe(0);
    expect(result[1].ratingsCount).toBe(0);
  });

  it("limits the result to the top 4 books", async () => {
    cache.get.mockResolvedValue(undefined);
    const books = [1, 2, 3, 4, 5, 6, 7].map((id) => makeBook({ id }));
    jest.spyOn(Book, "find").mockResolvedValue(books);
    mockRatingQueryBuilder(
      books.map((book) => ({
        bookId: book.id,
        average: String(book.id),
        count: "1",
      })),
    );
    mockPurchaseQueryBuilder([]);

    const result = await handler.execute();

    expect(result).toHaveLength(4);
    expect(result.map((b) => b.id)).toEqual([7, 6, 5, 4]);
  });

  it("skips the rating and purchase queries entirely when there are no books", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "find").mockResolvedValue([]);
    const ratingSpy = jest.spyOn(Rating, "createQueryBuilder");
    const purchaseSpy = jest.spyOn(OrderItem, "createQueryBuilder");

    const result = await handler.execute();

    expect(ratingSpy).not.toHaveBeenCalled();
    expect(purchaseSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("caches the computed result", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Book, "find").mockResolvedValue([]);

    await handler.execute();

    expect(cache.set).toHaveBeenCalledWith(
      TOP_RATED_BOOKS_CACHE_KEY,
      expect.anything(),
    );
  });

  it("maps authorIds from bookAuthors on the returned books", async () => {
    cache.get.mockResolvedValue(undefined);
    jest
      .spyOn(Book, "find")
      .mockResolvedValue([
        makeBook({ id: 1, bookAuthors: [{ authorId: 11 } as any] }),
      ]);
    mockRatingQueryBuilder([{ bookId: 1, average: "5.0", count: "1" }]);
    mockPurchaseQueryBuilder([{ bookId: 1, quantity: "17" }]);

    const result = await handler.execute();

    expect(result[0].authorIds).toEqual([11]);
    expect(result[0].purchasesCount).toBe(17);
  });
});
