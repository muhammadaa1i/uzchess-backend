import { GetNewsHandler } from "@/features/home/news/queries/get-news/get-news.handler";
import { GetNewsQuery } from "@/features/home/news/queries/get-news/get-news.query";
import { GetNewsRequest } from "@/features/home/news/queries/get-news/get-news.request";
import { News } from "@/features/home/entities/news/news.entity";

describe("GetNewsHandler", () => {
  let handler: GetNewsHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeNews = (overrides: Partial<News> = {}) =>
    ({
      id: 1,
      title: "Title",
      excerpt: "Excerpt",
      imageUrl: null,
      publishedAt: new Date("2026-08-01"),
      ...overrides,
    }) as News;

  const payload = (overrides: Partial<GetNewsRequest> = {}) =>
    ({ ...overrides }) as GetNewsRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetNewsHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached list on a default (no-filter) query when a cache hit exists", async () => {
    cache.get.mockResolvedValue({ totalCount: 1, data: [] });
    const findSpy = jest.spyOn(News, "find");

    const result = await handler.execute(new GetNewsQuery(payload()));

    expect(result).toEqual({ totalCount: 1, data: [] });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the news articles ordered by publishedAt desc, paginating with a default size of 12", async () => {
    const findSpy = jest
      .spyOn(News, "find")
      .mockResolvedValue([makeNews()]);

    const result = await handler.execute(new GetNewsQuery(payload()));

    expect(findSpy).toHaveBeenCalledWith({
      where: {},
      order: { publishedAt: "DESC" },
    });
    expect(result.data).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(cache.set).toHaveBeenCalledWith("news:list", result);
  });

  it("applies the search filter to the where clause and does not use or populate the default cache", async () => {
    const findSpy = jest.spyOn(News, "find").mockResolvedValue([]);

    await handler.execute(new GetNewsQuery(payload({ search: "chess" })));

    const callArgs = findSpy.mock.calls[0][0] as any;
    expect(callArgs.where.title).toBeDefined();
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("paginates using page/size and reports totalPages/hasNext/hasPrevious correctly", async () => {
    cache.get.mockResolvedValue(undefined);
    const news = [1, 2, 3, 4, 5].map((id) => makeNews({ id }));
    jest.spyOn(News, "find").mockResolvedValue(news);

    const result = await handler.execute(
      new GetNewsQuery(payload({ page: 2, size: 2 })),
    );

    expect(result.data).toHaveLength(2);
    expect(result.data.map((n: any) => n.id)).toEqual([3, 4]);
    expect(result.totalCount).toBe(5);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(2);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
  });

  it("caches the result only for the default (no-filter) query", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(News, "find").mockResolvedValue([]);

    await handler.execute(new GetNewsQuery(payload({ search: "chess" })));
    expect(cache.set).not.toHaveBeenCalled();

    jest.clearAllMocks();
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(News, "find").mockResolvedValue([]);

    await handler.execute(new GetNewsQuery(payload()));
    expect(cache.set).toHaveBeenCalledWith("news:list", expect.any(Object));
  });
});
