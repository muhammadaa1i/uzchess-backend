import { GetCourseCategoriesByIdHandler } from "@/features/common/category/queries/get-categories-by-id/get-categories-by-id.handler";
import { GetCourseCategoriesByIdQuery } from "@/features/common/category/queries/get-categories-by-id/get-categories-by-id.query";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { courseCategoryByIdCacheKey } from "@/features/common/category/category.cache";

describe("GetCourseCategoriesByIdHandler", () => {
  let handler: GetCourseCategoriesByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetCourseCategoriesByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the category from the DB and caches it on a cache miss", async () => {
    cache.get.mockResolvedValue(undefined);
    const findOneBySpy = jest
      .spyOn(CoursesCategory, "findOneBy")
      .mockResolvedValue({ id: 1, title: "Openings" } as any);

    const result = await handler.execute(new GetCourseCategoriesByIdQuery(1));

    expect(findOneBySpy).toHaveBeenCalledWith({ id: 1 });
    expect(result.id).toBe(1);
    expect(result.title).toBe("Openings");
    expect(cache.set).toHaveBeenCalledWith(courseCategoryByIdCacheKey(1), result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, title: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findOneBySpy = jest.spyOn(CoursesCategory, "findOneBy");

    const result = await handler.execute(new GetCourseCategoriesByIdQuery(1));

    expect(result).toBe(cached);
    expect(findOneBySpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetCourseCategoriesByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(cache.set).not.toHaveBeenCalled();
  });
});
