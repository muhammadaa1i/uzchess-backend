jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateNewsHandler } from "@/features/home/news/commands/update-news/update-news.handler";
import { UpdateNewsCommand } from "@/features/home/news/commands/update-news/update-news.command";
import { UpdateNewsRequest } from "@/features/home/news/commands/update-news/update-news.request";
import { News } from "@/features/home/entities/news/news.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("UpdateNewsHandler", () => {
  let handler: UpdateNewsHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new UpdateNewsHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates a news article on the happy path", async () => {
    const saveMock = jest.fn();
    const news = {
      id: 1,
      title: "Old Title",
      excerpt: "Old excerpt",
      content: "Old content",
      imageUrl: null,
      publishedAt: new Date("2026-08-01"),
      save: saveMock,
    };
    saveMock.mockImplementation(() => Promise.resolve(news));
    jest.spyOn(News, "findOneBy").mockResolvedValue(news as any);

    const payload: UpdateNewsRequest = { title: "New Title" };
    const result = await handler.execute(
      new UpdateNewsCommand(1, payload, undefined),
    );

    expect(news.title).toBe("New Title");
    expect(saveMock).toHaveBeenCalled();
    expect(result.title).toBe("New Title");
  });

  it("updates the content field when provided", async () => {
    const saveMock = jest.fn();
    const news = {
      id: 1,
      title: "Title",
      excerpt: "Excerpt",
      content: "Old content",
      imageUrl: null,
      publishedAt: new Date("2026-08-01"),
      save: saveMock,
    };
    saveMock.mockImplementation(() => Promise.resolve(news));
    jest.spyOn(News, "findOneBy").mockResolvedValue(news as any);

    const payload: UpdateNewsRequest = { content: "New content" };
    const result = await handler.execute(
      new UpdateNewsCommand(1, payload, undefined),
    );

    expect(news.content).toBe("New content");
    expect(result.content).toBe("New content");
  });

  it("deletes the old image when a new one is uploaded", async () => {
    const news = {
      id: 1,
      title: "Title",
      excerpt: "Excerpt",
      imageUrl: "https://r2.example.com/news/old.png",
      publishedAt: new Date("2026-08-01"),
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(News, "findOneBy").mockResolvedValue(news as any);

    const payload: UpdateNewsRequest = {};
    await handler.execute(
      new UpdateNewsCommand(1, payload, "https://r2.example.com/news/new.png"),
    );

    expect(deleteUploadedFile).toHaveBeenCalledWith(
      "https://r2.example.com/news/old.png",
    );
    expect(news.imageUrl).toBe("https://r2.example.com/news/new.png");
  });

  it("throws DoesNotExistException (404) when the news article doesn't exist", async () => {
    jest.spyOn(News, "findOneBy").mockResolvedValue(null);

    const payload: UpdateNewsRequest = { title: "New Title" };
    await expect(
      handler.execute(new UpdateNewsCommand(999, payload, undefined)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("invalidates the news list and by-id cache on success", async () => {
    const news = {
      id: 1,
      title: "Old Title",
      excerpt: "Old excerpt",
      imageUrl: null,
      publishedAt: new Date("2026-08-01"),
      save: jest.fn(),
    };
    news.save.mockImplementation(() => Promise.resolve(news));
    jest.spyOn(News, "findOneBy").mockResolvedValue(news as any);

    const payload: UpdateNewsRequest = { title: "New Title" };
    await handler.execute(new UpdateNewsCommand(1, payload, undefined));

    expect(cache.del).toHaveBeenCalledWith("news:list");
    expect(cache.del).toHaveBeenCalledWith("news:1");
  });
});
