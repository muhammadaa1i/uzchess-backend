import { DeleteLanguageHandler } from "@/features/library/languages/commands/delete-language/delete-language.handler";
import { DeleteLanguageCommand } from "@/features/library/languages/commands/delete-language/delete-language.command";
import { Language } from "@/features/library/entities/languages/language.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Course } from "@/features/common/entities/course/course.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { ConflictException } from "@nestjs/common";
import {
  LANGUAGES_LIST_CACHE_KEY,
  languageByIdCacheKey,
} from "@/features/library/languages/languages.cache";

describe("DeleteLanguageHandler", () => {
  let handler: DeleteLanguageHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteLanguageHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the language when it exists and isn't referenced by any book or course", async () => {
    const language = { id: 1, title: "English", code: "en" };
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const removeSpy = jest.spyOn(Language, "remove").mockResolvedValue(language as any);

    const result = await handler.execute(new DeleteLanguageCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(language);
    expect(result.message).toBe("Language deleted successfully");
  });

  it("invalidates the languages list and by-id caches on success", async () => {
    const language = { id: 1, title: "English", code: "en" };
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    jest.spyOn(Language, "remove").mockResolvedValue(language as any);

    await handler.execute(new DeleteLanguageCommand(1));

    expect(cache.del).toHaveBeenCalledWith(LANGUAGES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(languageByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the language doesn't exist", async () => {
    jest.spyOn(Language, "findOneBy").mockResolvedValue(null);
    const bookExistsSpy = jest.spyOn(Book, "existsBy");
    const courseExistsSpy = jest.spyOn(Course, "existsBy");
    const removeSpy = jest.spyOn(Language, "remove");

    await expect(handler.execute(new DeleteLanguageCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(bookExistsSpy).not.toHaveBeenCalled();
    expect(courseExistsSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws a 409 ConflictException when a book still references the language", async () => {
    const language = { id: 1, title: "English", code: "en" };
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    const bookExistsSpy = jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    const courseExistsSpy = jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const removeSpy = jest.spyOn(Language, "remove");

    await expect(handler.execute(new DeleteLanguageCommand(1))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(bookExistsSpy).toHaveBeenCalledWith({ languageId: 1 });
    expect(courseExistsSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it("throws a 409 ConflictException when a course still references the language (not just books)", async () => {
    const language = { id: 1, title: "English", code: "en" };
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    const bookExistsSpy = jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    const courseExistsSpy = jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    const removeSpy = jest.spyOn(Language, "remove");

    await expect(handler.execute(new DeleteLanguageCommand(1))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(courseExistsSpy).toHaveBeenCalledWith({ languageId: 1 });
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
