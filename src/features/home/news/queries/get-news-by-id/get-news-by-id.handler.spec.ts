import { GetNewsByIdHandler } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.handler";
import { GetNewsByIdQuery } from "@/features/home/news/queries/get-news-by-id/get-news-by-id.query";
import { News } from "@/features/home/entities/news/news.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetNewsByIdHandler", () => {
  let handler: GetNewsByIdHandler;

  beforeEach(() => {
    handler = new GetNewsByIdHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the news article on the happy path", async () => {
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
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(News, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetNewsByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
