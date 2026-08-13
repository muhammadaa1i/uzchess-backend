import { CreateCategoryHandler } from "@/features/library/category/commands/create-category/create-category.handler";
import { CreateCategoryCommand } from "@/features/library/category/commands/create-category/create-category.command";
import { CreateCategoryRequest } from "@/features/library/category/commands/create-category/create-category.request";
import { Category } from "@/features/library/entities/category/category.entity";
import { ConflictException } from "@nestjs/common";
import { CATEGORIES_LIST_CACHE_KEY } from "@/features/library/category/category.cache";

describe("CreateCategoryHandler", () => {
  let handler: CreateCategoryHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateCategoryHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a category when the title is unique", async () => {
    jest.spyOn(Category, "findOne").mockResolvedValue(null);
    const createSpy = jest.spyOn(Category, "create").mockReturnValue({ title: "Fiction" } as any);
    const saveSpy = jest
      .spyOn(Category, "save")
      .mockResolvedValue({ id: 1, title: "Fiction" } as any);

    const result = await handler.execute(
      new CreateCategoryCommand({ title: "Fiction" } as CreateCategoryRequest),
    );

    expect(createSpy).toHaveBeenCalledWith({ title: "Fiction" });
    expect(saveSpy).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Fiction");
  });

  it("invalidates the categories list cache on success", async () => {
    jest.spyOn(Category, "findOne").mockResolvedValue(null);
    jest.spyOn(Category, "create").mockReturnValue({} as any);
    jest.spyOn(Category, "save").mockResolvedValue({ id: 1, title: "Fiction" } as any);

    await handler.execute(new CreateCategoryCommand({ title: "Fiction" } as CreateCategoryRequest));

    expect(cache.del).toHaveBeenCalledWith(CATEGORIES_LIST_CACHE_KEY);
  });

  it("throws a 409 ConflictException when the title already exists (case-insensitive)", async () => {
    jest.spyOn(Category, "findOne").mockResolvedValue({ id: 1, title: "Fiction" } as any);
    const createSpy = jest.spyOn(Category, "create");
    const saveSpy = jest.spyOn(Category, "save");

    await expect(
      handler.execute(new CreateCategoryCommand({ title: "fiction" } as CreateCategoryRequest)),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
