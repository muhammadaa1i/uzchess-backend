import { GetNewsHandler } from "@/features/home/news/queries/get-news/get-news.handler";
import { GetNewsQuery } from "@/features/home/news/queries/get-news/get-news.query";
import { GetNewsRequest } from "@/features/home/news/queries/get-news/get-news.request";
import { News } from "@/features/home/entities/news/news.entity";

describe("GetNewsHandler", () => {
  let handler: GetNewsHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetNewsHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached news on a default (no-limit) query when a cache hit exists", async () => {
    cache.get.mockResolvedValue([{ id: 1, title: "Cached" }]);
    const findSpy = jest.spyOn(News, "find");

    const payload: GetNewsRequest = {};
    const result = await handler.execute(new GetNewsQuery(payload));

    expect(result).toEqual([{ id: 1, title: "Cached" }]);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the news articles ordered by publishedAt desc, defaulting to top 4", async () => {
    const findSpy = jest.spyOn(News, "find").mockResolvedValue([
      {
        id: 1,
        title: "Title",
        excerpt: "Excerpt",
        imageUrl: null,
        publishedAt: new Date("2026-08-01"),
      },
    ] as any);

    const payload: GetNewsRequest = {};
    const result = await handler.execute(new GetNewsQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      order: { publishedAt: "DESC" },
      take: 4,
    });
    expect(result).toHaveLength(1);
    expect(cache.set).toHaveBeenCalledWith("news:list", result);
  });

  it("respects a custom limit and does not use or populate the default cache", async () => {
    const findSpy = jest.spyOn(News, "find").mockResolvedValue([]);

    const payload: GetNewsRequest = { limit: 5 };
    await handler.execute(new GetNewsQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      order: { publishedAt: "DESC" },
      take: 5,
    });
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });
});
