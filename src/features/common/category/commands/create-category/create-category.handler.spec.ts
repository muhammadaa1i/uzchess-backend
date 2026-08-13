import { CreateCourseCategoryHandler } from "@/features/common/category/commands/create-category/create-category.handler";
import { CreateCourseCategoryCommand } from "@/features/common/category/commands/create-category/create-category.command";
import { CreateCourseCategoryRequest } from "@/features/common/category/commands/create-category/create-category.request";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { COURSE_CATEGORIES_LIST_CACHE_KEY } from "@/features/common/category/category.cache";

describe("CreateCourseCategoryHandler", () => {
  let handler: CreateCourseCategoryHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const basePayload = (overrides: Partial<CreateCourseCategoryRequest> = {}) =>
    ({
      title: "Openings",
      ...overrides,
    }) as CreateCourseCategoryRequest;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateCourseCategoryHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a category when the title is not already taken", async () => {
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(false);
    const createSpy = jest
      .spyOn(CoursesCategory, "create")
      .mockReturnValue({ title: "Openings" } as any);
    const saveSpy = jest
      .spyOn(CoursesCategory, "save")
      .mockResolvedValue({ id: 1, title: "Openings" } as any);

    const result = await handler.execute(new CreateCourseCategoryCommand(basePayload()));

    expect(createSpy).toHaveBeenCalledWith({ title: "Openings" });
    expect(saveSpy).toHaveBeenCalled();
    expect(result.id).toBe(1);
    expect(result.title).toBe("Openings");
  });

  it("invalidates the categories list cache on success", async () => {
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(false);
    jest.spyOn(CoursesCategory, "create").mockReturnValue({} as any);
    jest.spyOn(CoursesCategory, "save").mockResolvedValue({ id: 1, title: "Openings" } as any);

    await handler.execute(new CreateCourseCategoryCommand(basePayload()));

    expect(cache.del).toHaveBeenCalledWith(COURSE_CATEGORIES_LIST_CACHE_KEY);
  });

  it("throws AlreadyExistException (409) when the title is already taken", async () => {
    jest.spyOn(CoursesCategory, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(CoursesCategory, "create");
    const saveSpy = jest.spyOn(CoursesCategory, "save");

    await expect(
      handler.execute(new CreateCourseCategoryCommand(basePayload({ title: "Openings" }))),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
