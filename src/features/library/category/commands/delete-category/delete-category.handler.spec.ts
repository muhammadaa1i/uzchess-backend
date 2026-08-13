import { DeleteCategoryHandler } from "@/features/library/category/commands/delete-category/delete-category.handler";
import { DeleteCategoryCommand } from "@/features/library/category/commands/delete-category/delete-category.command";
import { Category } from "@/features/library/entities/category/category.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { ConflictException } from "@nestjs/common";
import {
  CATEGORIES_LIST_CACHE_KEY,
  categoryByIdCacheKey,
} from "@/features/library/category/category.cache";

describe("DeleteCategoryHandler", () => {
  let handler: DeleteCategoryHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteCategoryHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the category when it exists and isn't referenced by any book", async () => {
    const category = { id: 1, title: "Fiction" };
    jest.spyOn(Category, "findOneBy").mockResolvedValue(category as any);
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    const removeSpy = jest.spyOn(Category, "remove").mockResolvedValue(category as any);

    const result = await handler.execute(new DeleteCategoryCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(category);
    expect(result.message).toBe("Category deleted successfully");
  });

  it("invalidates the categories list and by-id caches on success", async () => {
    const category = { id: 1, title: "Fiction" };
    jest.spyOn(Category, "findOneBy").mockResolvedValue(category as any);
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    jest.spyOn(Category, "remove").mockResolvedValue(category as any);

    await handler.execute(new DeleteCategoryCommand(1));

    expect(cache.del).toHaveBeenCalledWith(CATEGORIES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(categoryByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the category doesn't exist", async () => {
    jest.spyOn(Category, "findOneBy").mockResolvedValue(null);
    const existsSpy = jest.spyOn(Book, "existsBy");
    const removeSpy = jest.spyOn(Category, "remove");

    await expect(handler.execute(new DeleteCategoryCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(existsSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws a 409 ConflictException when a book still references the category (checks Book only, not Course)", async () => {
    const category = { id: 1, title: "Fiction" };
    jest.spyOn(Category, "findOneBy").mockResolvedValue(category as any);
    const bookExistsSpy = jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    const removeSpy = jest.spyOn(Category, "remove");

    await expect(handler.execute(new DeleteCategoryCommand(1))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(bookExistsSpy).toHaveBeenCalledWith({ categoryId: 1 });
    expect(removeSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
