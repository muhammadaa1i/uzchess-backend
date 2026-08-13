import { GetLanguagesByIdHandler } from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.handler";
import { GetLanguagesByIdQuery } from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.query";
import { Language } from "@/features/library/entities/languages/language.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { languageByIdCacheKey } from "@/features/library/languages/languages.cache";

describe("GetLanguagesByIdHandler", () => {
  let handler: GetLanguagesByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetLanguagesByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the language and caches the result on a cache miss", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Language, "findOneBy")
      .mockResolvedValue({ id: 1, title: "English", code: "en" } as any);

    const result = await handler.execute(new GetLanguagesByIdQuery(1));

    expect(findSpy).toHaveBeenCalledWith({ id: 1 });
    expect(result.title).toBe("English");
    expect(cache.set).toHaveBeenCalledWith(languageByIdCacheKey(1), result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, title: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Language, "findOneBy");

    const result = await handler.execute(new GetLanguagesByIdQuery(1));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the language doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Language, "findOneBy").mockResolvedValue(null);

    await expect(handler.execute(new GetLanguagesByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
