import { GetLessonsByIdHandler } from "@/features/common/lesson/queries/get-lessons-by-id/get-lessons-by-id.handler";
import { GetLessonsByIdQuery } from "@/features/common/lesson/queries/get-lessons-by-id/get-lessons-by-id.query";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetLessonsByIdHandler", () => {
  let handler: GetLessonsByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetLessonsByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the lesson by id and caches the result", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue({
      id: 1,
      sectionId: 1,
      title: "Lesson 1",
      video: "v.mp4",
      thumbnail: null,
      duration: 60,
      order: 1,
      isFree: true,
    } as any);

    const result = await handler.execute(new GetLessonsByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.isFree).toBe(true);
    expect(cache.set).toHaveBeenCalledWith("lessons:1", result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, title: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(CourseLesson, "findOneBy");

    const result = await handler.execute(new GetLessonsByIdQuery(1));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the lesson doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(null);

    await expect(handler.execute(new GetLessonsByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
  });
});
