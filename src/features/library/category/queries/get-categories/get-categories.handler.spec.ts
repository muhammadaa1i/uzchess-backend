import { GetCategoriesHandler } from "@/features/library/category/queries/get-categories/get-categories.handler";
import { GetCategoriesQuery } from "@/features/library/category/queries/get-categories/get-categories.query";
import { GetCategoriesRequest } from "@/features/library/category/queries/get-categories/get-categories.request";
import { Category } from "@/features/library/entities/category/category.entity";
import { CATEGORIES_LIST_CACHE_KEY } from "@/features/library/category/category.cache";

describe("GetCategoriesHandler", () => {
  let handler: GetCategoriesHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetCategoriesHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns categories and caches the result on a cache miss when there's no search term", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Category, "find")
      .mockResolvedValue([{ id: 1, title: "Fiction" }] as any);

    const result = await handler.execute(new GetCategoriesQuery({} as GetCategoriesRequest));

    expect(findSpy).toHaveBeenCalledWith({ where: {} });
    expect(result).toHaveLength(1);
    expect(cache.set).toHaveBeenCalledWith(CATEGORIES_LIST_CACHE_KEY, result);
  });

  it("returns the cached list and skips the DB query when present", async () => {
    const cached = [{ id: 1, title: "Cached" }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Category, "find");

    const result = await handler.execute(new GetCategoriesQuery({} as GetCategoriesRequest));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("bypasses the cache entirely when a search term is provided", async () => {
    const findSpy = jest.spyOn(Category, "find").mockResolvedValue([] as any);

    await handler.execute(new GetCategoriesQuery({ search: "fic" } as GetCategoriesRequest));

    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(findSpy).toHaveBeenCalledWith({
      where: { title: expect.anything() },
    });
  });
});
