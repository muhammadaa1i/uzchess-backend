import { GetNewsHandler } from "@/features/home/news/queries/get-news/get-news.handler";
import { GetNewsQuery } from "@/features/home/news/queries/get-news/get-news.query";
import { GetNewsRequest } from "@/features/home/news/queries/get-news/get-news.request";
import { News } from "@/features/home/entities/news/news.entity";

describe("GetNewsHandler", () => {
  let handler: GetNewsHandler;

  beforeEach(() => {
    handler = new GetNewsHandler();
  });

  afterEach(() => jest.restoreAllMocks());

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
  });

  it("respects a custom limit", async () => {
    const findSpy = jest.spyOn(News, "find").mockResolvedValue([]);

    const payload: GetNewsRequest = { limit: 5 };
    await handler.execute(new GetNewsQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      order: { publishedAt: "DESC" },
      take: 5,
    });
  });
});
