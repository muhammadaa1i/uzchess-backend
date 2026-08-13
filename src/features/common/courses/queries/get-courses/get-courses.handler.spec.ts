import { GetCoursesHandler } from "@/features/common/courses/queries/get-courses/get-courses.handler";
import { GetCoursesQuery } from "@/features/common/courses/queries/get-courses/get-courses.query";
import { GetCoursesRequest } from "@/features/common/courses/queries/get-courses/get-courses.request";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { COURSES_LIST_CACHE_KEY } from "@/features/common/courses/course.cache";

describe("GetCoursesHandler", () => {
  let handler: GetCoursesHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const mockQueryBuilder = (getRawManyResult: any[]) => {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(getRawManyResult),
    };
    return qb;
  };

  const twoCourses = [
    {
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
    },
    {
      id: 2,
      title: "Course Two",
      price: 2000,
      discountPrice: 1500,
      cover: "c2.png",
      description: "d2",
      categoryId: 2,
      difficultyId: 2,
      languageId: 2,
      courseAuthors: [],
    },
  ];

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    handler = new GetCoursesHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("computes sectionsCount/lessonsCount per course from the aggregate query results and maps authorIds/ratings", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue(twoCourses as any);

    const ratingQb = mockQueryBuilder([{ courseId: 1, average: "4.5", count: "2" }]);
    const sectionsQb = mockQueryBuilder([
      { courseId: 1, count: "3" },
      { courseId: 2, count: "1" },
    ]);
    const lessonsQb = mockQueryBuilder([
      { courseId: 1, count: "10" },
      { courseId: 2, count: "2" },
    ]);

    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(ratingQb);
    jest.spyOn(CourseSection, "createQueryBuilder").mockReturnValue(sectionsQb);
    jest.spyOn(CourseLesson, "createQueryBuilder").mockReturnValue(lessonsQb);

    const result = await handler.execute(
      new GetCoursesQuery({} as GetCoursesRequest),
    );

    const course1 = result.data.find((c: any) => c.id === 1)!;
    const course2 = result.data.find((c: any) => c.id === 2)!;

    expect(course1.sectionsCount).toBe(3);
    expect(course1.lessonsCount).toBe(10);
    expect(course1.averageRating).toBe(4.5);
    expect(course1.ratingsCount).toBe(2);
    expect(course1.authorIds).toEqual([11, 12]);

    expect(course2.sectionsCount).toBe(1);
    expect(course2.lessonsCount).toBe(2);
    expect(course2.averageRating).toBe(0);
    expect(course2.ratingsCount).toBe(0);
    expect(course2.authorIds).toEqual([]);
  });

  it("defaults sectionsCount/lessonsCount to 0 for a course with no sections/lessons rows in the aggregate results", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue([twoCourses[0]] as any);

    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseSection, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseLesson, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));

    const result = await handler.execute(new GetCoursesQuery({} as GetCoursesRequest));

    expect(result.data[0].sectionsCount).toBe(0);
    expect(result.data[0].lessonsCount).toBe(0);
  });

  it("skips all aggregate queries when there are no courses", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue([]);
    const ratingSpy = jest.spyOn(CourseRating, "createQueryBuilder");
    const sectionsSpy = jest.spyOn(CourseSection, "createQueryBuilder");
    const lessonsSpy = jest.spyOn(CourseLesson, "createQueryBuilder");

    const result = await handler.execute(new GetCoursesQuery({} as GetCoursesRequest));

    expect(result.data).toEqual([]);
    expect(ratingSpy).not.toHaveBeenCalled();
    expect(sectionsSpy).not.toHaveBeenCalled();
    expect(lessonsSpy).not.toHaveBeenCalled();
  });

  it("filters by minRating using the computed averageRating after the aggregate join", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue(twoCourses as any);

    jest
      .spyOn(CourseRating, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([{ courseId: 1, average: "4.5", count: "2" }]));
    jest.spyOn(CourseSection, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseLesson, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));

    const result = await handler.execute(
      new GetCoursesQuery({ minRating: 4 } as GetCoursesRequest),
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);
    expect(result.totalCount).toBe(1);
  });

  it("returns the cached value and skips all queries for the default (no-filter) query when cached", async () => {
    const cached = { totalCount: 1, totalPages: 1, currentPage: 1, hasNext: false, hasPrevious: false, data: [] };
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Course, "find");

    const result = await handler.execute(new GetCoursesQuery({} as GetCoursesRequest));

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("caches the result only for the default (no-filter) query", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue([]);
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseSection, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseLesson, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));

    await handler.execute(new GetCoursesQuery({} as GetCoursesRequest));

    expect(cache.set).toHaveBeenCalledWith(COURSES_LIST_CACHE_KEY, expect.anything());
  });

  it("does not cache the result when a filter/search/pagination param is present", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue([]);
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseSection, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseLesson, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));

    await handler.execute(new GetCoursesQuery({ search: "chess" } as GetCoursesRequest));

    expect(cache.set).not.toHaveBeenCalled();
    expect(cache.get).not.toHaveBeenCalled();
  });
});
