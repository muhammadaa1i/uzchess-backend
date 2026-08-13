import { GetPurchasesHandler } from "@/features/common/purchase/queries/get-purchases/get-purchases.handler";
import { GetPurchasesQuery } from "@/features/common/purchase/queries/get-purchases/get-purchases.query";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { PurchaseStatus } from "@/core/enums/purchase-status.enum";

describe("GetPurchasesHandler", () => {
  let handler: GetPurchasesHandler;

  const mockQueryBuilder = (rows: any[]) => {
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(rows),
    };
    return qb;
  };

  beforeEach(() => {
    handler = new GetPurchasesHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns an empty array without querying courses/ratings/sections/lessons when there are no purchases", async () => {
    jest.spyOn(CoursePurchase, "findBy").mockResolvedValue([]);
    const courseFindSpy = jest.spyOn(Course, "find");
    const ratingQbSpy = jest.spyOn(CourseRating, "createQueryBuilder");
    const sectionQbSpy = jest.spyOn(CourseSection, "createQueryBuilder");
    const lessonQbSpy = jest.spyOn(CourseLesson, "createQueryBuilder");

    const result = await handler.execute(new GetPurchasesQuery(9));

    expect(result).toEqual([]);
    expect(courseFindSpy).not.toHaveBeenCalled();
    expect(ratingQbSpy).not.toHaveBeenCalled();
    expect(sectionQbSpy).not.toHaveBeenCalled();
    expect(lessonQbSpy).not.toHaveBeenCalled();
  });

  it("only queries purchases with Success status", async () => {
    const findBySpy = jest.spyOn(CoursePurchase, "findBy").mockResolvedValue([]);

    await handler.execute(new GetPurchasesQuery(9));

    expect(findBySpy).toHaveBeenCalledWith({
      userId: 9,
      status: PurchaseStatus.Success,
    });
  });

  it("computes sectionsCount and lessonsCount per course from the grouped query results, independent of ratings", async () => {
    jest.spyOn(CoursePurchase, "findBy").mockResolvedValue([
      { id: 1, courseId: 1, userId: 9, status: PurchaseStatus.Success },
      { id: 2, courseId: 2, userId: 9, status: PurchaseStatus.Success },
    ] as any);

    jest.spyOn(Course, "find").mockResolvedValue([
      {
        id: 1,
        title: "Course One",
        price: 100,
        discountPrice: null,
        cover: "cover1.png",
        description: "desc1",
        categoryId: 1,
        difficultyId: 1,
        languageId: 1,
        courseAuthors: [{ authorId: 11 }],
      },
      {
        id: 2,
        title: "Course Two",
        price: 200,
        discountPrice: 150,
        cover: "cover2.png",
        description: "desc2",
        categoryId: 2,
        difficultyId: 2,
        languageId: 2,
        courseAuthors: [],
      },
    ] as any);

    jest
      .spyOn(CourseRating, "createQueryBuilder")
      .mockReturnValue(mockQueryBuilder([{ courseId: 1, average: "4.0", count: "3" }]));

    // Course 1 has 3 sections, course 2 has 1 section.
    jest.spyOn(CourseSection, "createQueryBuilder").mockReturnValue(
      mockQueryBuilder([
        { courseId: 1, count: "3" },
        { courseId: 2, count: "1" },
      ]),
    );

    // Course 1 has 7 lessons total across its sections, course 2 has 2 lessons.
    jest.spyOn(CourseLesson, "createQueryBuilder").mockReturnValue(
      mockQueryBuilder([
        { courseId: 1, count: "7" },
        { courseId: 2, count: "2" },
      ]),
    );

    const result = await handler.execute(new GetPurchasesQuery(9));

    expect(result).toHaveLength(2);

    const course1 = result.find((c: any) => c.id === 1)!;
    expect(course1.sectionsCount).toBe(3);
    expect(course1.lessonsCount).toBe(7);
    expect(course1.averageRating).toBe(4.0);
    expect(course1.ratingsCount).toBe(3);
    expect(course1.authorIds).toEqual([11]);

    const course2 = result.find((c: any) => c.id === 2)!;
    expect(course2.sectionsCount).toBe(1);
    expect(course2.lessonsCount).toBe(2);
    // No rating rows for course 2 -> defaults to 0.
    expect(course2.averageRating).toBe(0);
    expect(course2.ratingsCount).toBe(0);
    expect(course2.authorIds).toEqual([]);
  });

  it("defaults sectionsCount and lessonsCount to 0 when a purchased course has no sections/lessons", async () => {
    jest.spyOn(CoursePurchase, "findBy").mockResolvedValue([
      { id: 1, courseId: 1, userId: 9, status: PurchaseStatus.Success },
    ] as any);

    jest.spyOn(Course, "find").mockResolvedValue([
      {
        id: 1,
        title: "Course One",
        price: 100,
        discountPrice: null,
        cover: "cover1.png",
        description: "desc1",
        categoryId: 1,
        difficultyId: 1,
        languageId: 1,
        courseAuthors: [],
      },
    ] as any);

    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseSection, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));
    jest.spyOn(CourseLesson, "createQueryBuilder").mockReturnValue(mockQueryBuilder([]));

    const result = await handler.execute(new GetPurchasesQuery(9));

    expect(result).toHaveLength(1);
    expect(result[0].sectionsCount).toBe(0);
    expect(result[0].lessonsCount).toBe(0);
  });
});
