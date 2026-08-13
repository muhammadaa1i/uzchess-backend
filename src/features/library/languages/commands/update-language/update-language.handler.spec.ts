import { UpdateLanguageHandler } from "@/features/library/languages/commands/update-language/update-language.handler";
import { UpdateLanguageCommand } from "@/features/library/languages/commands/update-language/update-language.command";
import { UpdateLanguageRequest } from "@/features/library/languages/commands/update-language/update-language.request";
import { Language } from "@/features/library/entities/languages/language.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import {
  LANGUAGES_LIST_CACHE_KEY,
  languageByIdCacheKey,
} from "@/features/library/languages/languages.cache";

describe("UpdateLanguageHandler", () => {
  let handler: UpdateLanguageHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateLanguageHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates title and code when found and both are unique", async () => {
    const language = { id: 1, title: "Old", code: "ol", save: jest.fn() };
    language.save.mockResolvedValue({ id: 1, title: "New", code: "nw" });
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);

    const result = await handler.execute(
      new UpdateLanguageCommand(1, { title: "New", code: "nw" } as UpdateLanguageRequest),
    );

    expect(language.title).toBe("New");
    expect(language.code).toBe("nw");
    expect(language.save).toHaveBeenCalled();
    expect(result.title).toBe("New");
    expect(result.code).toBe("nw");
  });

  it("invalidates the languages list and by-id caches on success", async () => {
    const language = {
      id: 1,
      title: "Old",
      code: "ol",
      save: jest.fn().mockResolvedValue({ id: 1, title: "New", code: "nw" }),
    };
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);

    await handler.execute(
      new UpdateLanguageCommand(1, { title: "New", code: "nw" } as UpdateLanguageRequest),
    );

    expect(cache.del).toHaveBeenCalledWith(LANGUAGES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(languageByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the language doesn't exist", async () => {
    jest.spyOn(Language, "findOneBy").mockResolvedValue(null);
    const existsSpy = jest.spyOn(Language, "existsBy");

    await expect(
      handler.execute(
        new UpdateLanguageCommand(999, { title: "New", code: "nw" } as UpdateLanguageRequest),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(existsSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when another language already has that title", async () => {
    const language = { id: 1, title: "Old", code: "ol", save: jest.fn() };
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    jest
      .spyOn(Language, "existsBy")
      .mockImplementation(async (where: any) => Boolean(where.title));

    await expect(
      handler.execute(
        new UpdateLanguageCommand(1, { title: "Taken", code: "zz" } as UpdateLanguageRequest),
      ),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(language.save).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when another language already has that code", async () => {
    const language = { id: 1, title: "Old", code: "ol", save: jest.fn() };
    jest.spyOn(Language, "findOneBy").mockResolvedValue(language as any);
    jest
      .spyOn(Language, "existsBy")
      .mockImplementation(async (where: any) => Boolean(where.code));

    await expect(
      handler.execute(
        new UpdateLanguageCommand(1, { title: "New Title", code: "en" } as UpdateLanguageRequest),
      ),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(language.save).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
