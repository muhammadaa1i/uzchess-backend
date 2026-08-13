import { GetLanguagesHandler } from "@/features/library/languages/queries/get-languages/get-languages.handler";
import { GetLanguagesQuery } from "@/features/library/languages/queries/get-languages/get-languages.query";
import { GetLanguagesRequest } from "@/features/library/languages/queries/get-languages/get-languages.request";
import { Language } from "@/features/library/entities/languages/language.entity";
import { LANGUAGES_LIST_CACHE_KEY } from "@/features/library/languages/languages.cache";

describe("GetLanguagesHandler", () => {
  let handler: GetLanguagesHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetLanguagesHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns languages and caches the result on a cache miss when there's no search term", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Language, "find")
      .mockResolvedValue([{ id: 1, title: "English", code: "en" }] as any);

    const result = await handler.execute(new GetLanguagesQuery({} as GetLanguagesRequest));

    expect(findSpy).toHaveBeenCalledWith({ where: {} });
    expect(result).toHaveLength(1);
    expect(cache.set).toHaveBeenCalledWith(LANGUAGES_LIST_CACHE_KEY, result);
  });

  it("returns the cached list and skips the DB query when present", async () => {
    const cached = [{ id: 1, title: "Cached" }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Language, "find");

    const result = await handler.execute(new GetLanguagesQuery({} as GetLanguagesRequest));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("bypasses the cache entirely when a search term is provided", async () => {
    const findSpy = jest.spyOn(Language, "find").mockResolvedValue([] as any);

    await handler.execute(new GetLanguagesQuery({ search: "eng" } as GetLanguagesRequest));

    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(findSpy).toHaveBeenCalledWith({
      where: { title: expect.anything() },
    });
  });
});
