import { CreateNewsHandler } from "@/features/home/news/commands/create-news/create-news.handler";
import { CreateNewsCommand } from "@/features/home/news/commands/create-news/create-news.command";
import { CreateNewsRequest } from "@/features/home/news/commands/create-news/create-news.request";
import { News } from "@/features/home/entities/news/news.entity";

describe("CreateNewsHandler", () => {
  let handler: CreateNewsHandler;

  beforeEach(() => {
    handler = new CreateNewsHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a news article on the happy path", async () => {
    const createSpy = jest.spyOn(News, "create").mockReturnValue({
      id: 1,
      title: "Chess Olympiad Kicks Off",
      excerpt: "The world's top players gather for the biennial event.",
      imageUrl: "https://r2.example.com/news/image.png",
      publishedAt: new Date("2026-08-01"),
    } as any);
    const saveSpy = jest.spyOn(News, "save").mockImplementation((n) => n);

    const payload: CreateNewsRequest = {
      title: "Chess Olympiad Kicks Off",
      excerpt: "The world's top players gather for the biennial event.",
      publishedAt: "2026-08-01",
    };
    const result = await handler.execute(
      new CreateNewsCommand(payload, "https://r2.example.com/news/image.png"),
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Chess Olympiad Kicks Off",
        excerpt: "The world's top players gather for the biennial event.",
        imageUrl: "https://r2.example.com/news/image.png",
      }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(result.title).toBe("Chess Olympiad Kicks Off");
  });

  it("defaults imageUrl to null when not provided", async () => {
    jest.spyOn(News, "create").mockReturnValue({
      id: 2,
      title: "Local Club News",
      excerpt: "A short update.",
      imageUrl: null,
      publishedAt: new Date("2026-08-02"),
    } as any);
    jest.spyOn(News, "save").mockImplementation((n) => n);

    const payload: CreateNewsRequest = {
      title: "Local Club News",
      excerpt: "A short update.",
      publishedAt: "2026-08-02",
    };
    const result = await handler.execute(
      new CreateNewsCommand(payload, undefined),
    );

    expect(result.imageUrl).toBeNull();
  });
});
