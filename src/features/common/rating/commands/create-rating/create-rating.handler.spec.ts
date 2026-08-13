import { ForbiddenException } from "@nestjs/common";
import { CreateRatingHandler } from "@/features/common/rating/commands/create-rating/create-rating.handler";
import { CreateRatingCommand } from "@/features/common/rating/commands/create-rating/create-rating.command";
import { CreateCourseRatingRequest } from "@/features/common/rating/commands/create-rating/create-rating.request";
import { Course } from "@/features/common/entities/course/course.entity";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { Certificate } from "@/features/common/entities/certificate/certificate.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

describe("CreateRatingHandler", () => {
  let handler: CreateRatingHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  function mockRatingAggregate(average: string | null, count: string) {
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ average, count }),
    };
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  }

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateRatingHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const certificateSpy = jest.spyOn(Certificate, "existsBy");
    const findRatingSpy = jest.spyOn(CourseRating, "findOneBy");

    await expect(
      handler.execute(
        new CreateRatingCommand(99, 1, { score: 5 } as CreateCourseRatingRequest),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);

    expect(certificateSpy).not.toHaveBeenCalled();
    expect(findRatingSpy).not.toHaveBeenCalled();
  });

  it("throws ForbiddenException (403) when the user has no certificate for the course", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(Certificate, "existsBy").mockResolvedValue(false);
    const findRatingSpy = jest.spyOn(CourseRating, "findOneBy");
    const saveSpy = jest.spyOn(CourseRating, "save");

    await expect(
      handler.execute(
        new CreateRatingCommand(1, 2, { score: 5 } as CreateCourseRatingRequest),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(findRatingSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("creates a new rating when the user holds a certificate and has not rated before", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(Certificate, "existsBy").mockResolvedValue(true);
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(null);
    const createSpy = jest.spyOn(CourseRating, "create").mockImplementation(
      (data: any) => data,
    );
    const saveSpy = jest.spyOn(CourseRating, "save").mockImplementation(
      (data: any) => Promise.resolve(data),
    );
    mockRatingAggregate("4.0", "1");

    const result = await handler.execute(
      new CreateRatingCommand(1, 2, {
        score: 4,
        comment: "great course",
      } as CreateCourseRatingRequest),
    );

    expect(createSpy).toHaveBeenCalledWith({
      courseId: 1,
      userId: 2,
      score: 4,
      comment: "great course",
    });
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.courseId).toBe(1);
    expect(result.score).toBe(4);
    expect(result.comment).toBe("great course");
    expect(result.averageRating).toBe(4);
    expect(result.ratingsCount).toBe(1);
  });

  it("updates the existing rating in place (not a duplicate create) on a repeat rating", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(Certificate, "existsBy").mockResolvedValue(true);
    const existingRating: any = {
      id: 55,
      courseId: 1,
      userId: 2,
      score: 3,
      comment: "ok",
    };
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(existingRating);
    const createSpy = jest.spyOn(CourseRating, "create");
    const saveSpy = jest.spyOn(CourseRating, "save").mockImplementation(
      (data: any) => Promise.resolve(data),
    );
    mockRatingAggregate("5.0", "1");

    const result = await handler.execute(
      new CreateRatingCommand(1, 2, {
        score: 5,
        comment: "actually amazing",
      } as CreateCourseRatingRequest),
    );

    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 55, score: 5, comment: "actually amazing" }),
    );
    expect(existingRating.score).toBe(5);
    expect(existingRating.comment).toBe("actually amazing");
    expect(result.averageRating).toBe(5);
    expect(result.ratingsCount).toBe(1);
  });

  it("recalculates the average across all ratings after an update-in-place", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(Certificate, "existsBy").mockResolvedValue(true);
    const existingRating: any = { id: 55, courseId: 1, userId: 2, score: 3, comment: null };
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(existingRating);
    jest.spyOn(CourseRating, "save").mockImplementation((data: any) => Promise.resolve(data));
    // average across e.g. 3 ratings after the update
    mockRatingAggregate("4.333333", "3");

    const result = await handler.execute(
      new CreateRatingCommand(1, 2, { score: 5 } as CreateCourseRatingRequest),
    );

    expect(result.averageRating).toBe(4.3);
    expect(result.ratingsCount).toBe(3);
  });

  it("keeps the previous comment when no comment is supplied on an update", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(Certificate, "existsBy").mockResolvedValue(true);
    const existingRating: any = { id: 55, courseId: 1, userId: 2, score: 3, comment: "old comment" };
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(existingRating);
    jest.spyOn(CourseRating, "save").mockImplementation((data: any) => Promise.resolve(data));
    mockRatingAggregate("3.0", "1");

    await handler.execute(new CreateRatingCommand(1, 2, { score: 3 } as CreateCourseRatingRequest));

    expect(existingRating.comment).toBe("old comment");
  });

  it("invalidates the courses list and course-by-id caches on success", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(Certificate, "existsBy").mockResolvedValue(true);
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(null);
    jest.spyOn(CourseRating, "create").mockImplementation((data: any) => data);
    jest.spyOn(CourseRating, "save").mockImplementation((data: any) => Promise.resolve(data));
    mockRatingAggregate("4.0", "1");

    await handler.execute(
      new CreateRatingCommand(7, 2, { score: 4 } as CreateCourseRatingRequest),
    );

    expect(cache.del).toHaveBeenCalledWith(COURSES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(courseByIdCacheKey(7));
  });

  it("returns 0 average and 0 count when the aggregate query yields no rows", async () => {
    jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    jest.spyOn(Certificate, "existsBy").mockResolvedValue(true);
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(null);
    jest.spyOn(CourseRating, "create").mockImplementation((data: any) => data);
    jest.spyOn(CourseRating, "save").mockImplementation((data: any) => Promise.resolve(data));
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(CourseRating, "createQueryBuilder").mockReturnValue(queryBuilder);

    const result = await handler.execute(
      new CreateRatingCommand(1, 2, { score: 4 } as CreateCourseRatingRequest),
    );

    expect(result.averageRating).toBe(0);
    expect(result.ratingsCount).toBe(0);
  });
});
