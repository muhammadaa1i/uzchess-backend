jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateBookHandler } from "@/features/library/book/commands/update-book/update-book.handler";
import { UpdateBookCommand } from "@/features/library/book/commands/update-book/update-book.command";
import { UpdateBookRequest } from "@/features/library/book/commands/update-book/update-book.request";
import { Book } from "@/features/library/entities/book/book.entity";
import { BookAuthor } from "@/features/library/entities/book/book-author.entity";
import { Category } from "@/features/library/entities/category/category.entity";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Language } from "@/features/library/entities/languages/language.entity";
import { Author } from "@/features/library/entities/author/author.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("UpdateBookHandler", () => {
  let handler: UpdateBookHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeBook = (overrides: Partial<Book> = {}) =>
    ({
      id: 1,
      title: "Old title",
      price: 100,
      discountPrice: 10,
      cover: "old-cover.png",
      description: "old desc",
      pageCount: 100,
      publishedYear: 2019,
      categoryId: 1,
      difficultyId: 1,
      languageId: 1,
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as Book;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new UpdateBookHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the book doesn't exist", async () => {
    jest.spyOn(Book, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateBookCommand(999, {} as UpdateBookRequest, undefined)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("only changes fields that were provided, leaving other fields alone", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(BookAuthor, "findBy").mockResolvedValue([{ authorId: 11 } as any]);

    const payload = { title: "New title" } as UpdateBookRequest;

    await handler.execute(new UpdateBookCommand(1, payload, undefined));

    expect(book.title).toBe("New title");
    // untouched fields
    expect(book.price).toBe(100);
    expect(book.discountPrice).toBe(10);
    expect(book.description).toBe("old desc");
    expect(book.pageCount).toBe(100);
    expect(book.publishedYear).toBe(2019);
    expect(book.categoryId).toBe(1);
    expect(book.difficultyId).toBe(1);
    expect(book.languageId).toBe(1);
    expect(book.cover).toBe("old-cover.png");
  });

  it("applies discountPrice: 0 explicitly (undefined-check, not falsy-check)", async () => {
    const book = makeBook({ discountPrice: 25 });
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(BookAuthor, "findBy").mockResolvedValue([]);

    const payload = { discountPrice: 0 } as UpdateBookRequest;

    await handler.execute(new UpdateBookCommand(1, payload, undefined));

    expect(book.discountPrice).toBe(0);
  });

  it("applies discountPrice: null to clear an existing discount", async () => {
    const book = makeBook({ discountPrice: 25 });
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(BookAuthor, "findBy").mockResolvedValue([]);

    const payload = { discountPrice: null } as UpdateBookRequest;

    await handler.execute(new UpdateBookCommand(1, payload, undefined));

    expect(book.discountPrice).toBeNull();
  });

  it("throws DoesNotExistException (404) when the new categoryId doesn't exist", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(Category, "existsBy").mockResolvedValue(false);
    const saveSpy = jest.spyOn(book, "save");

    await expect(
      handler.execute(
        new UpdateBookCommand(1, { categoryId: 99 } as UpdateBookRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the new difficultyId doesn't exist", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);

    await expect(
      handler.execute(
        new UpdateBookCommand(1, { difficultyId: 99 } as UpdateBookRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (404) when the new languageId doesn't exist", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);

    await expect(
      handler.execute(
        new UpdateBookCommand(1, { languageId: 99 } as UpdateBookRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (404) when one or more new authorIds don't exist", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(Author, "countBy").mockResolvedValue(1);
    const bookAuthorSaveSpy = jest.spyOn(BookAuthor, "save");

    await expect(
      handler.execute(
        new UpdateBookCommand(1, { authorIds: [11, 12] } as UpdateBookRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(bookAuthorSaveSpy).not.toHaveBeenCalled();
  });

  it("replaces BookAuthor rows when authorIds is provided", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(Author, "countBy").mockResolvedValue(2);
    const deleteSpy = jest.spyOn(BookAuthor, "delete").mockResolvedValue(undefined as any);
    const createSpy = jest
      .spyOn(BookAuthor, "create")
      .mockImplementation((data: any) => data as any);
    const saveSpy = jest.spyOn(BookAuthor, "save").mockResolvedValue(undefined as any);

    const result = await handler.execute(
      new UpdateBookCommand(1, { authorIds: [21, 22] } as UpdateBookRequest, undefined),
    );

    expect(deleteSpy).toHaveBeenCalledWith({ bookId: 1 });
    expect(createSpy).toHaveBeenCalledWith({ bookId: 1, authorId: 21 });
    expect(createSpy).toHaveBeenCalledWith({ bookId: 1, authorId: 22 });
    expect(saveSpy).toHaveBeenCalledWith([
      { bookId: 1, authorId: 21 },
      { bookId: 1, authorId: 22 },
    ]);
    expect(result.authorIds).toEqual([21, 22]);
  });

  it("keeps the existing authors and returns their ids when authorIds isn't provided", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(BookAuthor, "findBy").mockResolvedValue([
      { authorId: 31 } as any,
      { authorId: 32 } as any,
    ]);
    const bookAuthorSaveSpy = jest.spyOn(BookAuthor, "save");

    const result = await handler.execute(
      new UpdateBookCommand(1, {} as UpdateBookRequest, undefined),
    );

    expect(bookAuthorSaveSpy).not.toHaveBeenCalled();
    expect(result.authorIds).toEqual([31, 32]);
  });

  it("replaces the cover and deletes the old one from storage", async () => {
    const book = makeBook({ cover: "old-cover.png" });
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(BookAuthor, "findBy").mockResolvedValue([]);

    await handler.execute(
      new UpdateBookCommand(1, {} as UpdateBookRequest, "new-cover.png"),
    );

    expect(book.cover).toBe("new-cover.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("old-cover.png");
  });

  it("does not touch the cover or call deleteUploadedFile when no new cover is uploaded", async () => {
    const book = makeBook({ cover: "old-cover.png" });
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(BookAuthor, "findBy").mockResolvedValue([]);

    await handler.execute(new UpdateBookCommand(1, {} as UpdateBookRequest, undefined));

    expect(book.cover).toBe("old-cover.png");
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("invalidates books list and book-by-id caches on success", async () => {
    const book = makeBook();
    jest.spyOn(Book, "findOneBy").mockResolvedValue(book);
    jest.spyOn(BookAuthor, "findBy").mockResolvedValue([]);

    await handler.execute(new UpdateBookCommand(1, {} as UpdateBookRequest, undefined));

    expect(cache.del).toHaveBeenCalledWith("books:list");
    expect(cache.del).toHaveBeenCalledWith("books:1");
  });
});
