import { CreateBookHandler } from "@/features/library/book/commands/create-book/create-book.handler";
import { CreateBookCommand } from "@/features/library/book/commands/create-book/create-book.command";
import { CreateBookRequest } from "@/features/library/book/commands/create-book/create-book.request";
import { Book } from "@/features/library/entities/book/book.entity";
import { BookAuthor } from "@/features/library/entities/book/book-author.entity";
import { Category } from "@/features/library/entities/category/category.entity";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Language } from "@/features/library/entities/languages/language.entity";
import { Author } from "@/features/library/entities/author/author.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("CreateBookHandler", () => {
  let handler: CreateBookHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const basePayload = (overrides: Partial<CreateBookRequest> = {}) =>
    ({
      title: "Book title",
      price: 100,
      description: "desc",
      pageCount: 200,
      publishedYear: 2020,
      categoryId: 1,
      difficultyId: 2,
      languageId: 3,
      authorIds: [11, 12],
      ...overrides,
    }) as CreateBookRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CreateBookHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    jest.spyOn(Category, "existsBy").mockResolvedValue(false);
    const difficultySpy = jest.spyOn(Difficulty, "existsBy");
    const createSpy = jest.spyOn(Book, "create");

    await expect(
      handler.execute(new CreateBookCommand(basePayload(), "covers/c1.png")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(difficultySpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the difficulty doesn't exist", async () => {
    jest.spyOn(Category, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);
    const languageSpy = jest.spyOn(Language, "existsBy");
    const createSpy = jest.spyOn(Book, "create");

    await expect(
      handler.execute(new CreateBookCommand(basePayload(), "covers/c1.png")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(languageSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the language doesn't exist", async () => {
    jest.spyOn(Category, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);
    const authorSpy = jest.spyOn(Author, "countBy");
    const createSpy = jest.spyOn(Book, "create");

    await expect(
      handler.execute(new CreateBookCommand(basePayload(), "covers/c1.png")),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(authorSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when one or more authors don't exist", async () => {
    jest.spyOn(Category, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    jest.spyOn(Language, "existsBy").mockResolvedValue(true);
    jest.spyOn(Author, "countBy").mockResolvedValue(1);
    const createSpy = jest.spyOn(Book, "create");

    await expect(
      handler.execute(
        new CreateBookCommand(basePayload({ authorIds: [11, 12] }), "covers/c1.png"),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("creates the book, persists the cover path and creates BookAuthor join rows for every author", async () => {
    jest.spyOn(Category, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    jest.spyOn(Language, "existsBy").mockResolvedValue(true);
    jest.spyOn(Author, "countBy").mockResolvedValue(2);

    const createSpy = jest.spyOn(Book, "create").mockReturnValue({
      id: 5,
      title: "Book title",
      cover: "covers/c1.png",
    } as any);
    const saveSpy = jest.spyOn(Book, "save").mockResolvedValue(undefined as any);
    const bookAuthorCreateSpy = jest
      .spyOn(BookAuthor, "create")
      .mockImplementation((data: any) => data as any);
    const bookAuthorSaveSpy = jest
      .spyOn(BookAuthor, "save")
      .mockResolvedValue(undefined as any);

    const result = await handler.execute(
      new CreateBookCommand(basePayload({ authorIds: [11, 12] }), "covers/c1.png"),
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Book title",
        cover: "covers/c1.png",
        categoryId: 1,
        difficultyId: 2,
        languageId: 3,
      }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(bookAuthorCreateSpy).toHaveBeenCalledWith({ bookId: 5, authorId: 11 });
    expect(bookAuthorCreateSpy).toHaveBeenCalledWith({ bookId: 5, authorId: 12 });
    expect(bookAuthorSaveSpy).toHaveBeenCalledWith([
      { bookId: 5, authorId: 11 },
      { bookId: 5, authorId: 12 },
    ]);
    expect(result.cover).toBe("covers/c1.png");
    expect(result.authorIds).toEqual([11, 12]);
  });

  it("invalidates the books list cache on success", async () => {
    jest.spyOn(Category, "existsBy").mockResolvedValue(true);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    jest.spyOn(Language, "existsBy").mockResolvedValue(true);
    jest.spyOn(Author, "countBy").mockResolvedValue(2);
    jest.spyOn(Book, "create").mockReturnValue({ id: 5 } as any);
    jest.spyOn(Book, "save").mockResolvedValue(undefined as any);
    jest.spyOn(BookAuthor, "create").mockImplementation((data: any) => data as any);
    jest.spyOn(BookAuthor, "save").mockResolvedValue(undefined as any);

    await handler.execute(
      new CreateBookCommand(basePayload({ authorIds: [11, 12] }), "covers/c1.png"),
    );

    expect(cache.del).toHaveBeenCalledWith("books:list");
  });
});
