import { GetFavouritesHandler } from "@/features/common/favourite/queries/get-favourites/get-favourites.handler";
import { GetFavouritesQuery } from "@/features/common/favourite/queries/get-favourites/get-favourites.query";
import { CourseFavourite } from "@/features/common/entities/favourite/course-favourite.entity";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";

describe("GetFavouritesHandler", () => {
  let handler: GetFavouritesHandler;

  function mockAggregateQueryBuilder(entity: any, rows: any[]) {
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(rows),
    };
    jest.spyOn(entity, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  }

  beforeEach(() => {
    handler = new GetFavouritesHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("maps favourited courses with authorIds, rating stats, sections and lessons counts", async () => {
    jest.spyOn(CourseFavourite, "findBy").mockResolvedValue([
      { courseId: 1, userId: 9 },
      { courseId: 2, userId: 9 },
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
        courseAuthors: [{ authorId: 11 }, { authorId: 12 }],
      },
      {
        id: 2,
        title: "Course Two",
        price: 50,
        discountPrice: 40,
        cover: "cover2.png",
        description: "desc2",
        categoryId: 2,
        difficultyId: 2,
        languageId: 2,
        courseAuthors: [],
      },
    ] as any);

    mockAggregateQueryBuilder(CourseRating, [
      { courseId: 1, average: "4.5", count: "2" },
    ]);
    mockAggregateQueryBuilder(CourseSection, [
      { courseId: 1, count: "3" },
    ]);
    mockAggregateQueryBuilder(CourseLesson, [
      { courseId: 1, count: "10" },
    ]);

    const result = await handler.execute(new GetFavouritesQuery(9));

    expect(result).toHaveLength(2);

    const course1 = result.find((c: any) => c.id === 1)!;
    expect(course1.authorIds).toEqual([11, 12]);
    expect(course1.averageRating).toBe(4.5);
    expect(course1.ratingsCount).toBe(2);
    expect(course1.sectionsCount).toBe(3);
    expect(course1.lessonsCount).toBe(10);

    const course2 = result.find((c: any) => c.id === 2)!;
    expect(course2.authorIds).toEqual([]);
    expect(course2.averageRating).toBe(0);
    expect(course2.ratingsCount).toBe(0);
    expect(course2.sectionsCount).toBe(0);
    expect(course2.lessonsCount).toBe(0);
  });

  it("returns an empty array and skips course/rating/section/lesson lookups when there are no favourites", async () => {
    jest.spyOn(CourseFavourite, "findBy").mockResolvedValue([]);
    const courseFindSpy = jest.spyOn(Course, "find");
    const ratingSpy = jest.spyOn(CourseRating, "createQueryBuilder");
    const sectionSpy = jest.spyOn(CourseSection, "createQueryBuilder");
    const lessonSpy = jest.spyOn(CourseLesson, "createQueryBuilder");

    const result = await handler.execute(new GetFavouritesQuery(9));

    expect(result).toEqual([]);
    expect(courseFindSpy).not.toHaveBeenCalled();
    expect(ratingSpy).not.toHaveBeenCalled();
    expect(sectionSpy).not.toHaveBeenCalled();
    expect(lessonSpy).not.toHaveBeenCalled();
  });
});
