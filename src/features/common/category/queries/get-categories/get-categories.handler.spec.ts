import { GetCourseCategoriesHandler } from "@/features/common/category/queries/get-categories/get-categories.handler";
import { GetCourseCategoriesQuery } from "@/features/common/category/queries/get-categories/get-categories.query";
import { GetCourseCategoriesRequest } from "@/features/common/category/queries/get-categories/get-categories.request";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { COURSE_CATEGORIES_LIST_CACHE_KEY } from "@/features/common/category/category.cache";

describe("GetCourseCategoriesHandler", () => {
  let handler: GetCourseCategoriesHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetCourseCategoriesHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns categories from the DB and caches the result on a cache miss (no search)", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest.spyOn(CoursesCategory, "find").mockResolvedValue([
      { id: 1, title: "Openings" },
      { id: 2, title: "Endgames" },
    ] as any);

    const result = await handler.execute(
      new GetCourseCategoriesQuery({} as GetCourseCategoriesRequest),
    );

    expect(findSpy).toHaveBeenCalledWith({ where: {} });
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Openings");
    expect(cache.set).toHaveBeenCalledWith(COURSE_CATEGORIES_LIST_CACHE_KEY, result);
  });

  it("returns the cached value and skips the DB query when present (no search)", async () => {
    const cached = [{ id: 1, title: "Cached" }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(CoursesCategory, "find");

    const result = await handler.execute(
      new GetCourseCategoriesQuery({} as GetCourseCategoriesRequest),
    );

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("bypasses the cache entirely and applies an ILIKE filter when a search term is given", async () => {
    const findSpy = jest.spyOn(CoursesCategory, "find").mockResolvedValue([
      { id: 1, title: "Openings" },
    ] as any);

    const result = await handler.execute(
      new GetCourseCategoriesQuery({ search: "open" } as GetCourseCategoriesRequest),
    );

    expect(cache.get).not.toHaveBeenCalled();
    expect(findSpy).toHaveBeenCalledWith({
      where: { title: expect.objectContaining({ _type: "ilike" }) },
    });
    expect(result).toHaveLength(1);
    expect(cache.set).not.toHaveBeenCalled();
  });
});
