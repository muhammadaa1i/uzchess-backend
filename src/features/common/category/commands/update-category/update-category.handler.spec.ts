import { UpdateCourseCategoryHandler } from "@/features/common/category/commands/update-category/update-category.handler";
import { UpdateCourseCategoryCommand } from "@/features/common/category/commands/update-category/update-category.command";
import { UpdateCourseCategoryRequest } from "@/features/common/category/commands/update-category/update-category.request";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import {
  COURSE_CATEGORIES_LIST_CACHE_KEY,
  courseCategoryByIdCacheKey,
} from "@/features/common/category/category.cache";

describe("UpdateCourseCategoryHandler", () => {
  let handler: UpdateCourseCategoryHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const basePayload = (overrides: Partial<UpdateCourseCategoryRequest> = {}) =>
    ({
      title: "Endgames",
      ...overrides,
    }) as UpdateCourseCategoryRequest;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateCourseCategoryHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates the category title when it exists and the new title is free", async () => {
    const category = {
      id: 1,
      title: "Openings",
      save: jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      }),
    } as any;
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(category);
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(false);

    const result = await handler.execute(new UpdateCourseCategoryCommand(1, basePayload()));

    expect(category.title).toBe("Endgames");
    expect(category.save).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Endgames");
  });

  it("invalidates the categories list and by-id caches on success", async () => {
    const category = { id: 1, title: "Openings", save: jest.fn().mockResolvedValue(undefined) };
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(category as any);
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(false);

    await handler.execute(new UpdateCourseCategoryCommand(1, basePayload()));

    expect(cache.del).toHaveBeenCalledWith(COURSE_CATEGORIES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(courseCategoryByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(null);
    const existsSpy = jest.spyOn(CoursesCategory, "existsBy");

    await expect(
      handler.execute(new UpdateCourseCategoryCommand(999, basePayload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(existsSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when another category already has the new title", async () => {
    const category = { id: 1, title: "Openings", save: jest.fn() };
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(category as any);
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(true);

    await expect(
      handler.execute(new UpdateCourseCategoryCommand(1, basePayload({ title: "Endgames" }))),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(category.save).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
