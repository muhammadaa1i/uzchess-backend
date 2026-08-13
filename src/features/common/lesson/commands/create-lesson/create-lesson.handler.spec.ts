import { CreateLessonHandler } from "@/features/common/lesson/commands/create-lesson/create-lesson.handler";
import { CreateLessonCommand } from "@/features/common/lesson/commands/create-lesson/create-lesson.command";
import { CreateLessonRequest } from "@/features/common/lesson/commands/create-lesson/create-lesson.request";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("CreateLessonHandler", () => {
  let handler: CreateLessonHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const basePayload = (overrides: Partial<CreateLessonRequest> = {}) =>
    ({
      sectionId: 1,
      title: "Lesson 1",
      duration: 120,
      order: 1,
      ...overrides,
    }) as CreateLessonRequest;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateLessonHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a lesson with isFree defaulting to false when omitted", async () => {
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);
    const createSpy = jest.spyOn(CourseLesson, "create").mockReturnValue({} as any);
    const saveSpy = jest
      .spyOn(CourseLesson, "save")
      .mockResolvedValue({ id: 10, sectionId: 1, title: "Lesson 1", isFree: false } as any);

    const result = await handler.execute(
      new CreateLessonCommand(basePayload(), "video/path.mp4", undefined),
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sectionId: 1,
        title: "Lesson 1",
        video: "video/path.mp4",
        thumbnail: null,
        duration: 120,
        order: 1,
        isFree: false,
      }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(result.isFree).toBe(false);
  });

  it("honors isFree when explicitly provided as true", async () => {
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);
    const createSpy = jest.spyOn(CourseLesson, "create").mockReturnValue({} as any);
    jest
      .spyOn(CourseLesson, "save")
      .mockResolvedValue({ id: 10, sectionId: 1, title: "Lesson 1", isFree: true } as any);

    const result = await handler.execute(
      new CreateLessonCommand(basePayload({ isFree: true }), "video/path.mp4", "thumb/path.png"),
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ isFree: true, thumbnail: "thumb/path.png" }),
    );
    expect(result.isFree).toBe(true);
  });

  it("invalidates lesson list, course-by-id and courses-list caches on success", async () => {
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);
    jest.spyOn(CourseLesson, "create").mockReturnValue({} as any);
    jest.spyOn(CourseLesson, "save").mockResolvedValue({ id: 10, sectionId: 1 } as any);

    await handler.execute(new CreateLessonCommand(basePayload(), "video/path.mp4", undefined));

    expect(cache.del).toHaveBeenCalledWith("lessons:section:1");
    expect(cache.del).toHaveBeenCalledWith("courses:5");
    expect(cache.del).toHaveBeenCalledWith("courses:list");
  });

  it("throws DoesNotExistException (404) when the section doesn't exist", async () => {
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue(null);
    const createSpy = jest.spyOn(CourseLesson, "create");
    const saveSpy = jest.spyOn(CourseLesson, "save");

    await expect(
      handler.execute(new CreateLessonCommand(basePayload(), "video/path.mp4", undefined)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
