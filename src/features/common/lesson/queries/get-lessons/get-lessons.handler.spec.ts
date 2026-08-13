import { GetLessonsHandler } from "@/features/common/lesson/queries/get-lessons/get-lessons.handler";
import { GetLessonsQuery } from "@/features/common/lesson/queries/get-lessons/get-lessons.query";
import { GetLessonsRequest } from "@/features/common/lesson/queries/get-lessons/get-lessons.request";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";

describe("GetLessonsHandler", () => {
  let handler: GetLessonsHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetLessonsHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns lessons for a section ordered by `order`, and caches the result", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest.spyOn(CourseLesson, "find").mockResolvedValue([
      { id: 1, sectionId: 1, title: "L1", video: "v1.mp4", thumbnail: null, duration: 60, order: 1, isFree: false },
      { id: 2, sectionId: 1, title: "L2", video: "v2.mp4", thumbnail: "t2.png", duration: 90, order: 2, isFree: true },
    ] as any);

    const result = await handler.execute(new GetLessonsQuery({ sectionId: 1 } as GetLessonsRequest));

    expect(findSpy).toHaveBeenCalledWith({
      where: { sectionId: 1 },
      order: { order: "ASC" },
    });
    expect(result).toHaveLength(2);
    expect(result[0].isFree).toBe(false);
    expect(result[1].isFree).toBe(true);
    expect(cache.set).toHaveBeenCalledWith("lessons:section:1", result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = [{ id: 1, sectionId: 1, title: "Cached" }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(CourseLesson, "find");

    const result = await handler.execute(new GetLessonsQuery({ sectionId: 1 } as GetLessonsRequest));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });
});
