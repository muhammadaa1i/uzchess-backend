import { CreateLanguageHandler } from "@/features/library/languages/commands/create-language/create-language.handler";
import { CreateLanguageCommand } from "@/features/library/languages/commands/create-language/create-language.command";
import { CreateLanguageRequest } from "@/features/library/languages/commands/create-language/create-language.request";
import { Language } from "@/features/library/entities/languages/language.entity";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { LANGUAGES_LIST_CACHE_KEY } from "@/features/library/languages/languages.cache";

describe("CreateLanguageHandler", () => {
  let handler: CreateLanguageHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateLanguageHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a language when both title and code are unique", async () => {
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);
    const createSpy = jest
      .spyOn(Language, "create")
      .mockReturnValue({ title: "English", code: "en" } as any);
    const saveSpy = jest
      .spyOn(Language, "save")
      .mockResolvedValue({ id: 1, title: "English", code: "en" } as any);

    const result = await handler.execute(
      new CreateLanguageCommand({ title: "English", code: "en" } as CreateLanguageRequest),
    );

    expect(createSpy).toHaveBeenCalledWith({ title: "English", code: "en" });
    expect(saveSpy).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.code).toBe("en");
  });

  it("invalidates the languages list cache on success", async () => {
    jest.spyOn(Language, "existsBy").mockResolvedValue(false);
    jest.spyOn(Language, "create").mockReturnValue({} as any);
    jest.spyOn(Language, "save").mockResolvedValue({ id: 1, title: "English", code: "en" } as any);

    await handler.execute(
      new CreateLanguageCommand({ title: "English", code: "en" } as CreateLanguageRequest),
    );

    expect(cache.del).toHaveBeenCalledWith(LANGUAGES_LIST_CACHE_KEY);
  });

  it("throws AlreadyExistException (409) when the title already exists", async () => {
    jest
      .spyOn(Language, "existsBy")
      .mockImplementation(async (where: any) => Boolean(where.title));
    const createSpy = jest.spyOn(Language, "create");

    await expect(
      handler.execute(
        new CreateLanguageCommand({ title: "English", code: "zz" } as CreateLanguageRequest),
      ),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when the code already exists", async () => {
    jest
      .spyOn(Language, "existsBy")
      .mockImplementation(async (where: any) => Boolean(where.code));
    const createSpy = jest.spyOn(Language, "create");

    await expect(
      handler.execute(
        new CreateLanguageCommand({ title: "Uzbek New", code: "en" } as CreateLanguageRequest),
      ),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
