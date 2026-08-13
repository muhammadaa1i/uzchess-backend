import { CreateSectionHandler } from "@/features/common/section/commands/create-section/create-section.handler";
import { CreateSectionCommand } from "@/features/common/section/commands/create-section/create-section.command";
import { CreateSectionRequest } from "@/features/common/section/commands/create-section/create-section.request";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("CreateSectionHandler", () => {
  let handler: CreateSectionHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const basePayload = (overrides: Partial<CreateSectionRequest> = {}) =>
    ({
      courseId: 5,
      title: "Section 1",
      order: 1,
      ...overrides,
    }) as CreateSectionRequest;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateSectionHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a section when the course exists", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(CourseSection, "create").mockReturnValue({} as any);
    const saveSpy = jest
      .spyOn(CourseSection, "save")
      .mockResolvedValue({ id: 10, courseId: 5, title: "Section 1", order: 1 } as any);

    const result = await handler.execute(new CreateSectionCommand(basePayload()));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ courseId: 5, title: "Section 1", order: 1 }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(result.id).toBe(10);
    expect(result.title).toBe("Section 1");
  });

  it("invalidates the sections list, course-by-id and courses-list caches on success", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(CourseSection, "create").mockReturnValue({} as any);
    jest.spyOn(CourseSection, "save").mockResolvedValue({ id: 10, courseId: 5 } as any);

    await handler.execute(new CreateSectionCommand(basePayload()));

    expect(cache.del).toHaveBeenCalledWith("sections:course:5");
    expect(cache.del).toHaveBeenCalledWith("courses:5");
    expect(cache.del).toHaveBeenCalledWith("courses:list");
  });

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const createSpy = jest.spyOn(CourseSection, "create");
    const saveSpy = jest.spyOn(CourseSection, "save");

    await expect(
      handler.execute(new CreateSectionCommand(basePayload({ courseId: 999 }))),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
