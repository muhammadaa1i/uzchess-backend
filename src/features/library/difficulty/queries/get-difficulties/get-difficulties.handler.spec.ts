import { GetDifficultiesHandler } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.handler";
import { GetDifficultiesQuery } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.query";
import { GetDifficultiesRequest } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.request";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { DIFFICULTIES_LIST_CACHE_KEY } from "@/features/library/difficulty/difficulty.cache";

describe("GetDifficultiesHandler", () => {
  let handler: GetDifficultiesHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetDifficultiesHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns difficulties and caches the result on a cache miss when there's no search term", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Difficulty, "find")
      .mockResolvedValue([{ id: 1, degree: "Beginner", icon: "icon.png" }] as any);

    const result = await handler.execute(new GetDifficultiesQuery({} as GetDifficultiesRequest));

    expect(findSpy).toHaveBeenCalledWith({ where: {} });
    expect(result).toHaveLength(1);
    expect(cache.set).toHaveBeenCalledWith(DIFFICULTIES_LIST_CACHE_KEY, result);
  });

  it("returns the cached list and skips the DB query when present", async () => {
    const cached = [{ id: 1, degree: "Cached" }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Difficulty, "find");

    const result = await handler.execute(new GetDifficultiesQuery({} as GetDifficultiesRequest));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("bypasses the cache entirely when a search term is provided", async () => {
    const findSpy = jest.spyOn(Difficulty, "find").mockResolvedValue([] as any);

    await handler.execute(new GetDifficultiesQuery({ search: "beg" } as GetDifficultiesRequest));

    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(findSpy).toHaveBeenCalledWith({
      where: { degree: expect.anything() },
    });
  });
});
