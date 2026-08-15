jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteNewsHandler } from "@/features/home/news/commands/delete-news/delete-news.handler";
import { DeleteNewsCommand } from "@/features/home/news/commands/delete-news/delete-news.command";
import { News } from "@/features/home/entities/news/news.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeleteNewsHandler", () => {
  let handler: DeleteNewsHandler;

  beforeEach(() => {
    handler = new DeleteNewsHandler();
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes a news article and its image on the happy path", async () => {
    const news = {
      id: 1,
      title: "Title",
      imageUrl: "https://r2.example.com/news/image.png",
    };
    jest.spyOn(News, "findOneBy").mockResolvedValue(news as any);
    const removeSpy = jest.spyOn(News, "remove").mockResolvedValue(news as any);

    const result = await handler.execute(new DeleteNewsCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(news);
    expect(deleteUploadedFile).toHaveBeenCalledWith(
      "https://r2.example.com/news/image.png",
    );
    expect(result).toEqual({ message: "News deleted successfully" });
  });

  it("skips image deletion when the news article has no image", async () => {
    const news = { id: 1, title: "Title", imageUrl: null };
    jest.spyOn(News, "findOneBy").mockResolvedValue(news as any);
    jest.spyOn(News, "remove").mockResolvedValue(news as any);

    await handler.execute(new DeleteNewsCommand(1));

    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(News, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(News, "remove");

    await expect(
      handler.execute(new DeleteNewsCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
