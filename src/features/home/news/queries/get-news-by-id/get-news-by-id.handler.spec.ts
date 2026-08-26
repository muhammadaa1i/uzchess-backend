import { GetNewsByIdHandler } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.handler";
import { GetNewsByIdQuery } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.query";
import { News } from "@/features/home/entities/news/news.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetNewsByIdHandler", () => {
  let handler: GetNewsByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  function mockIncrementQueryBuilder() {
    const queryBuilder: any = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(News, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  }

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetNewsByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("increments the view count and returns a fresh count on a cache hit", async () => {
    cache.get.mockResolvedValue({
      id: 1,
      title: "Cached",
      viewsCount: 4,
      relatedNews: [{ id: 999, title: "Stale/deleted article" }],
    });
    const queryBuilder = mockIncrementQueryBuilder();
    const findOneSpy = jest
      .spyOn(News, "findOne")
      .mockResolvedValue({ viewsCount: 5 } as any);
    const findOneBySpy = jest.spyOn(News, "findOneBy");
    const findSpy = jest.spyOn(News, "find").mockResolvedValue([
      {
        id: 2,
        title: "Other News",
        excerpt: "Other excerpt",
        imageUrl: null,
        publishedAt: new Date("2026-07-30"),
      } as any,
    ]);

    const result = await handler.execute(new GetNewsByIdQuery(1));

    expect(queryBuilder.set).toHaveBeenCalledWith(
      expect.objectContaining({ viewsCount: expect.any(Function) }),
    );
    expect(queryBuilder.where).toHaveBeenCalledWith("id = :id", { id: 1 });
    expect(queryBuilder.execute).toHaveBeenCalled();
    expect(findOneSpy).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { viewsCount: true },
    });
    expect(findOneBySpy).not.toHaveBeenCalled();
    // relatedNews must be recomputed fresh on every cache hit too, not
    // served from the cached payload, so a since-deleted/updated article
    // doesn't linger in it for the life of the cache entry.
    expect(findSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { publishedAt: "DESC" },
        take: 3,
      }),
    );
    expect(result).toEqual({
      id: 1,
      title: "Cached",
      viewsCount: 5,
      relatedNews: [expect.objectContaining({ id: 2, title: "Other News" })],
    });
  });

  it("returns the news article with content, viewsCount and relatedNews on the happy path", async () => {
    cache.get.mockResolvedValue(undefined);
    mockIncrementQueryBuilder();
    jest.spyOn(News, "findOneBy").mockResolvedValue({
      id: 1,
      title: "Title",
      excerpt: "Excerpt",
      content: "Full body",
      imageUrl: null,
      publishedAt: new Date("2026-08-01"),
      viewsCount: 3,
    } as any);
    const findSpy = jest.spyOn(News, "find").mockResolvedValue([
      {
        id: 2,
        title: "Other News",
        excerpt: "Other excerpt",
        imageUrl: null,
        publishedAt: new Date("2026-07-30"),
      } as any,
    ]);

    const result = await handler.execute(new GetNewsByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.title).toBe("Title");
    expect(result.content).toBe("Full body");
    expect(result.viewsCount).toBe(3);
    expect(result.relatedNews).toHaveLength(1);
    expect(result.relatedNews[0].id).toBe(2);
    expect(findSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { publishedAt: "DESC" },
        take: 3,
      }),
    );
    expect(cache.set).toHaveBeenCalledWith("news:1", result);
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    cache.get.mockResolvedValue(undefined);
    mockIncrementQueryBuilder();
    jest.spyOn(News, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetNewsByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
