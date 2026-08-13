jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteBookHandler } from "@/features/library/book/commands/delete-book/delete-book.handler";
import { DeleteBookCommand } from "@/features/library/book/commands/delete-book/delete-book.command";
import { Book } from "@/features/library/entities/book/book.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeleteBookHandler", () => {
  let handler: DeleteBookHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new DeleteBookHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the book doesn't exist", async () => {
    jest.spyOn(Book, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Book, "remove");

    await expect(
      handler.execute(new DeleteBookCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("removes the book and deletes its cover from storage", async () => {
    const book = { id: 1, cover: "covers/c1.png" } as any;
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    const removeSpy = jest.spyOn(Book, "remove").mockResolvedValue(undefined as any);

    const result = await handler.execute(new DeleteBookCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(book);
    expect(deleteUploadedFile).toHaveBeenCalledWith("covers/c1.png");
    expect(result.message).toBe("Book deleted successfully");
  });

  it("invalidates books list and book-by-id caches on success", async () => {
    const book = { id: 7, cover: "covers/c7.png" } as any;
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(Book, "remove").mockResolvedValue(undefined as any);

    await handler.execute(new DeleteBookCommand(7));

    expect(cache.del).toHaveBeenCalledWith("books:list");
    expect(cache.del).toHaveBeenCalledWith("books:7");
  });
});
