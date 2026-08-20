import { GetNewsByIdHandler } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.handler";
import { GetNewsByIdQuery } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.query";
import { News } from "@/features/home/entities/news/news.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetNewsByIdHandler", () => {
  let handler: GetNewsByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetNewsByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue({ id: 1, title: "Cached" });
    const findSpy = jest.spyOn(News, "findOneBy");

    const result = await handler.execute(new GetNewsByIdQuery(1));

    expect(result).toEqual({ id: 1, title: "Cached" });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the news article on the happy path", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(News, "findOneBy").mockResolvedValue({
      id: 1,
      title: "Title",
      excerpt: "Excerpt",
      imageUrl: null,
      publishedAt: new Date("2026-08-01"),
    } as any);

    const result = await handler.execute(new GetNewsByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.title).toBe("Title");
    expect(cache.set).toHaveBeenCalledWith("news:1", result);
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(News, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetNewsByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
