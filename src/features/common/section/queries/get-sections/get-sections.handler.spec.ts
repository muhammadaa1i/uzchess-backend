import { GetSectionsHandler } from "@/features/common/section/queries/get-sections/get-sections.handler";
import { GetSectionsQuery } from "@/features/common/section/queries/get-sections/get-sections.query";
import { GetSectionsRequest } from "@/features/common/section/queries/get-sections/get-sections.request";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";

describe("GetSectionsHandler", () => {
  let handler: GetSectionsHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetSectionsHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns sections for a course ordered by `order`, and caches the result on a cache miss", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest.spyOn(CourseSection, "find").mockResolvedValue([
      { id: 1, courseId: 5, title: "S1", order: 1 },
      { id: 2, courseId: 5, title: "S2", order: 2 },
    ] as any);

    const result = await handler.execute(
      new GetSectionsQuery({ courseId: 5 } as GetSectionsRequest),
    );

    expect(findSpy).toHaveBeenCalledWith({
      where: { courseId: 5 },
      order: { order: "ASC" },
    });
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("S1");
    expect(cache.set).toHaveBeenCalledWith("sections:course:5", result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = [{ id: 1, courseId: 5, title: "Cached" }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(CourseSection, "find");

    const result = await handler.execute(
      new GetSectionsQuery({ courseId: 5 } as GetSectionsRequest),
    );

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });
});
