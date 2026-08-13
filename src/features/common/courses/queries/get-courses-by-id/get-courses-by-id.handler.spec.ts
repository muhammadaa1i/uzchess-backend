import { GetCoursesByIdHandler } from "@/features/common/courses/queries/get-courses-by-id/get-courses-by-id.handler";
import { GetCoursesByIdQuery } from "@/features/common/courses/queries/get-courses-by-id/get-courses-by-id.query";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { courseByIdCacheKey } from "@/features/common/courses/course.cache";

describe("GetCoursesByIdHandler", () => {
  let handler: GetCoursesByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const mockRatingQb = (raw: { average: string | null; count: string } | null) => {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(raw),
    };
    return qb;
  };

  const courseWithSections = {
    id: 1,
    title: "Course One",
    price: 1000,
    discountPrice: null,
    cover: "c1.png",
    description: "d1",
    categoryId: 1,
    difficultyId: 1,
    languageId: 1,
    courseAuthors: [{ authorId: 11 }, { authorId: 12 }],
    sections: [
      {
        id: 20,
        title: "Section B",
        order: 2,
        lessons: [
          { id: 200, title: "Lesson B2", order: 2 },
          { id: 201, title: "Lesson B1", order: 1 },
        ],
      },
      {
        id: 21,
        title: "Section A",
        order: 1,
        lessons: [{ id: 210, title: "Lesson A1", order: 1 }],
      },
    ],
  };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetCoursesByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the course with sections and lessons sorted by `order`, and correct sectionsCount/lessonsCount", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "findOne").mockResolvedValue(courseWithSections as any);
    jest
      .spyOn(CourseRating, "createQueryBuilder")
      .mockReturnValue(mockRatingQb({ average: "4.2", count: "5" }));

    const result = await handler.execute(new GetCoursesByIdQuery(1));

    expect(Course.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { courseAuthors: true, sections: { lessons: true } },
    });

    // Sections sorted by order ascending: Section A (order 1) then Section B (order 2)
    expect(result.sections.map((s: any) => s.title)).toEqual(["Section A", "Section B"]);
    // Lessons within Section B sorted by order ascending
    const sectionB = result.sections.find((s: any) => s.title === "Section B")!;
    expect(sectionB.lessons.map((l: any) => l.title)).toEqual(["Lesson B1", "Lesson B2"]);

    expect(result.sectionsCount).toBe(2);
    expect(result.lessonsCount).toBe(3);
    expect(result.averageRating).toBe(4.2);
    expect(result.ratingsCount).toBe(5);
    expect(result.authorIds).toEqual([11, 12]);
  });

  it("defaults averageRating/ratingsCount to 0 when there are no ratings", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "findOne").mockResolvedValue({
      ...courseWithSections,
      sections: [],
    } as any);
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(mockRatingQb(null));

    const result = await handler.execute(new GetCoursesByIdQuery(1));

    expect(result.averageRating).toBe(0);
    expect(result.ratingsCount).toBe(0);
    expect(result.sectionsCount).toBe(0);
    expect(result.lessonsCount).toBe(0);
    expect(result.sections).toEqual([]);
  });

  it("caches the result under the course-by-id key", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "findOne").mockResolvedValue({
      ...courseWithSections,
      sections: [],
    } as any);
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(mockRatingQb(null));

    const result = await handler.execute(new GetCoursesByIdQuery(1));

    expect(cache.set).toHaveBeenCalledWith(courseByIdCacheKey(1), result);
  });

  it("returns the cached value and skips the DB query when present", async () => {
    const cached = { id: 1, title: "Cached" };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Course, "findOne");

    const result = await handler.execute(new GetCoursesByIdQuery(1));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "findOne").mockResolvedValue(null);

    await expect(handler.execute(new GetCoursesByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
  });
});
