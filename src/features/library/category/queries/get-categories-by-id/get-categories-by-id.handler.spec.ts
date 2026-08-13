import { GetCategoriesByIdHandler } from "@/features/library/category/queries/get-categories-by-id/get-categories-by-id.handler";
import { GetCategoriesByIdQuery } from "@/features/library/category/queries/get-categories-by-id/get-categories-by-id.query";
import { Category } from "@/features/library/entities/category/category.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { categoryByIdCacheKey } from "@/features/library/category/category.cache";

describe("GetCategoriesByIdHandler", () => {
  let handler: GetCategoriesByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetCategoriesByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the category and caches the result on a cache miss", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest
      .spyOn(Category, "findOneBy")
      .mockResolvedValue({ id: 1, title: "Fiction" } as any);

    const result = await handler.execute(new GetCategoriesByIdQuery(1));

    expect(findSpy).toHaveBeenCalledWith({ id: 1 });
    expect(result.title).toBe("Fiction");
    expect(cache.set).toHaveBeenCalledWith(categoryByIdCacheKey(1), result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, title: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Category, "findOneBy");

    const result = await handler.execute(new GetCategoriesByIdQuery(1));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Category, "findOneBy").mockResolvedValue(null);

    await expect(handler.execute(new GetCategoriesByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
