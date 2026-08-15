import { GetTopRatedCoursesHandler } from "@/features/common/courses/queries/get-top-rated-courses/get-top-rated-courses.handler";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { TOP_RATED_COURSES_CACHE_KEY } from "@/features/common/courses/course.cache";

describe("GetTopRatedCoursesHandler", () => {
  let handler: GetTopRatedCoursesHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const mockQueryBuilder = (getRawManyResult: any[]) => {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(getRawManyResult),
    };
    return qb;
  };

  const makeCourse = (overrides: Partial<Course> = {}) =>
    ({
      id: 1,
      title: "Course",
      price: 1000,
      discountPrice: null,
      cover: "cover.png",
      description: "desc",
      categoryId: 1,
      difficultyId: 1,
      languageId: 1,
      courseAuthors: [],
      ...overrides,
    }) as unknown as Course;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetTopRatedCoursesHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached list when a cache hit exists and skips querying courses", async () => {
    const cached = [{ id: 1 }];
    cache.get.mockResolvedValue(cached);
    const findSpy = jest.spyOn(Course, "find");

    const result = await handler.execute();

    expect(result).toBe(cached);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("sorts courses by computed averageRating descending", async () => {
    cache.get.mockResolvedValue(undefined);
    jest
      .spyOn(Course, "find")
      .mockResolvedValue([
        makeCourse({ id: 1 }),
        makeCourse({ id: 2 }),
        makeCourse({ id: 3 }),
      ]);
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(
      mockQueryBuilder([
        { courseId: 1, average: "3.0", count: "2" },
        { courseId: 2, average: "4.8", count: "5" },
      ]),
    );
    jest
      .spyOn(CourseSection, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));
    jest
      .spyOn(CourseLesson, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));
    jest
      .spyOn(CoursePurchase, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));

    const result = await handler.execute();

    expect(result.map((c) => c.id)).toEqual([2, 1, 3]);
  });

  it("sorts courses with zero ratings last, not erroring on a missing average", async () => {
    cache.get.mockResolvedValue(undefined);
    jest
      .spyOn(Course, "find")
      .mockResolvedValue([makeCourse({ id: 1 }), makeCourse({ id: 2 })]);
    jest
      .spyOn(CourseRating, "createQueryBuilder")
      .mockReturnValue(
        mockQueryBuilder([{ courseId: 2, average: "4.0", count: "1" }]),
      );
    jest
      .spyOn(CourseSection, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));
    jest
      .spyOn(CourseLesson, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));
    jest
      .spyOn(CoursePurchase, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));

    const result = await handler.execute();

    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
    expect(result[1].averageRating).toBe(0);
    expect(result[1].ratingsCount).toBe(0);
  });

  it("limits the result to the top 4 courses", async () => {
    cache.get.mockResolvedValue(undefined);
    const courses = [1, 2, 3, 4, 5, 6, 7].map((id) => makeCourse({ id }));
    jest.spyOn(Course, "find").mockResolvedValue(courses);
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(
      mockQueryBuilder(
        courses.map((course) => ({
          courseId: course.id,
          average: String(course.id),
          count: "1",
        })),
      ),
    );
    jest
      .spyOn(CourseSection, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));
    jest
      .spyOn(CourseLesson, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));
    jest
      .spyOn(CoursePurchase, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([]));

    const result = await handler.execute();

    expect(result).toHaveLength(4);
    expect(result.map((c) => c.id)).toEqual([7, 6, 5, 4]);
  });

  it("skips all aggregate queries when there are no courses", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue([]);
    const ratingSpy = jest.spyOn(CourseRating, "createQueryBuilder");
    const sectionsSpy = jest.spyOn(CourseSection, "createQueryBuilder");
    const lessonsSpy = jest.spyOn(CourseLesson, "createQueryBuilder");
    const purchasesSpy = jest.spyOn(CoursePurchase, "createQueryBuilder");

    const result = await handler.execute();

    expect(result).toEqual([]);
    expect(ratingSpy).not.toHaveBeenCalled();
    expect(sectionsSpy).not.toHaveBeenCalled();
    expect(lessonsSpy).not.toHaveBeenCalled();
    expect(purchasesSpy).not.toHaveBeenCalled();
  });

  it("caches the computed result", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Course, "find").mockResolvedValue([]);

    await handler.execute();

    expect(cache.set).toHaveBeenCalledWith(
      TOP_RATED_COURSES_CACHE_KEY,
      expect.anything(),
    );
  });

  it("maps authorIds, sectionsCount and lessonsCount on the returned courses", async () => {
    cache.get.mockResolvedValue(undefined);
    jest
      .spyOn(Course, "find")
      .mockResolvedValue([
        makeCourse({ id: 1, courseAuthors: [{ authorId: 11 } as any] }),
      ]);
    jest
      .spyOn(CourseRating, "createQueryBuilder")
      .mockReturnValue(
        mockQueryBuilder([{ courseId: 1, average: "5.0", count: "1" }]),
      );
    jest
      .spyOn(CourseSection, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([{ courseId: 1, count: "3" }]));
    jest
      .spyOn(CourseLesson, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([{ courseId: 1, count: "9" }]));
    jest
      .spyOn(CoursePurchase, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([{ courseId: 1, count: "42" }]));

    const result = await handler.execute();

    expect(result[0].authorIds).toEqual([11]);
    expect(result[0].sectionsCount).toBe(3);
    expect(result[0].lessonsCount).toBe(9);
    expect(result[0].purchasesCount).toBe(42);
  });
});
