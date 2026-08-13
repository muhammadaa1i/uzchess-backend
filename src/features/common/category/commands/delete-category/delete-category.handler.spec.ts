import { DeleteCourseCategoryHandler } from "@/features/common/category/commands/delete-category/delete-category.handler";
import { DeleteCourseCategoryCommand } from "@/features/common/category/commands/delete-category/delete-category.command";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { Course } from "@/features/common/entities/course/course.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { ConflictException } from "@nestjs/common";
import {
  COURSE_CATEGORIES_LIST_CACHE_KEY,
  courseCategoryByIdCacheKey,
} from "@/features/common/category/category.cache";

describe("DeleteCourseCategoryHandler", () => {
  let handler: DeleteCourseCategoryHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteCourseCategoryHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes the category when it exists and no course references it", async () => {
    const category = { id: 1, title: "Openings" } as any;
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(category);
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const removeSpy = jest.spyOn(CoursesCategory, "remove").mockResolvedValue(category);

    const result = await handler.execute(new DeleteCourseCategoryCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(category);
    expect(result.message).toBe("Category deleted successfully");
  });

  it("invalidates the categories list and by-id caches on success", async () => {
    const category = { id: 1, title: "Openings" } as any;
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(category);
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    jest.spyOn(CoursesCategory, "remove").mockResolvedValue(category);

    await handler.execute(new DeleteCourseCategoryCommand(1));

    expect(cache.del).toHaveBeenCalledWith(COURSE_CATEGORIES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(courseCategoryByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(null);
    const existsSpy = jest.spyOn(Course, "existsBy");
    const removeSpy = jest.spyOn(CoursesCategory, "remove");

    await expect(
      handler.execute(new DeleteCourseCategoryCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(existsSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws ConflictException (409) when a course still references the category", async () => {
    const category = { id: 1, title: "Openings" } as any;
    jest.spyOn(CoursesCategory, "findOneBy").mockResolvedValue(category);
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    const removeSpy = jest.spyOn(CoursesCategory, "remove");

    await expect(
      handler.execute(new DeleteCourseCategoryCommand(1)),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(removeSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
