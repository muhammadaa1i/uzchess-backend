import { UpdateCategoryHandler } from "@/features/library/category/commands/update-category/update-category.handler";
import { UpdateCategoryCommand } from "@/features/library/category/commands/update-category/update-category.command";
import { UpdateCategoryRequest } from "@/features/library/category/commands/update-category/update-category.request";
import { Category } from "@/features/library/entities/category/category.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import {
  CATEGORIES_LIST_CACHE_KEY,
  categoryByIdCacheKey,
} from "@/features/library/category/category.cache";

describe("UpdateCategoryHandler", () => {
  let handler: UpdateCategoryHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateCategoryHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates the category's title when found and the new title is unique", async () => {
    const category = { id: 1, title: "Old", save: jest.fn() };
    category.save.mockResolvedValue({ id: 1, title: "New" });
    jest.spyOn(Category, "findOneBy").mockResolvedValue(category as any);
    jest.spyOn(Category, "existsBy").mockResolvedValue(false);

    const result = await handler.execute(
      new UpdateCategoryCommand(1, { title: "New" } as UpdateCategoryRequest),
    );

    expect(category.title).toBe("New");
    expect(category.save).toHaveBeenCalled();
    expect(result.title).toBe("New");
  });

  it("invalidates the categories list and by-id caches on success", async () => {
    const category = { id: 1, title: "Old", save: jest.fn().mockResolvedValue({ id: 1, title: "New" }) };
    jest.spyOn(Category, "findOneBy").mockResolvedValue(category as any);
    jest.spyOn(Category, "existsBy").mockResolvedValue(false);

    await handler.execute(new UpdateCategoryCommand(1, { title: "New" } as UpdateCategoryRequest));

    expect(cache.del).toHaveBeenCalledWith(CATEGORIES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(categoryByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    jest.spyOn(Category, "findOneBy").mockResolvedValue(null);
    const existsSpy = jest.spyOn(Category, "existsBy");

    await expect(
      handler.execute(new UpdateCategoryCommand(999, { title: "New" } as UpdateCategoryRequest)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(existsSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when another category already has that title", async () => {
    const category = { id: 1, title: "Old", save: jest.fn() };
    jest.spyOn(Category, "findOneBy").mockResolvedValue(category as any);
    jest.spyOn(Category, "existsBy").mockResolvedValue(true);

    await expect(
      handler.execute(new UpdateCategoryCommand(1, { title: "Taken" } as UpdateCategoryRequest)),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(category.save).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
