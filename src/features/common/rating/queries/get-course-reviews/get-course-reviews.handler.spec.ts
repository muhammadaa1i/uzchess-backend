import { GetCourseReviewsHandler } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.handler";
import { GetCourseReviewsQuery } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.query";
import { GetCourseReviewsRequest } from "@/features/common/rating/queries/get-course-reviews/get-course-reviews.request";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";

describe("GetCourseReviewsHandler", () => {
  let handler: GetCourseReviewsHandler;

  beforeEach(() => {
    handler = new GetCourseReviewsHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("maps reviews with the reviewer's full name and paginates with defaults (page 1, size 5)", async () => {
    const findAndCountSpy = jest.spyOn(CourseRating, "findAndCount").mockResolvedValue([
      [
        {
          id: 1,
          userId: 9,
          user: { firstName: "Jane", lastName: "Doe" },
          score: 5,
          comment: "great",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ] as any,
      1,
    ]);

    const result = await handler.execute(
      new GetCourseReviewsQuery(3, {} as GetCourseReviewsRequest),
    );

    expect(findAndCountSpy).toHaveBeenCalledWith({
      where: { courseId: 3 },
      relations: { user: true },
      order: { createdAt: "DESC" },
      skip: 0,
      take: 5,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].userFullName).toBe("Jane Doe");
    expect(result.data[0].score).toBe(5);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });

  it("computes skip/take and hasNext/hasPrevious for a middle page", async () => {
    const findAndCountSpy = jest.spyOn(CourseRating, "findAndCount").mockResolvedValue([
      [],
      12,
    ]);

    const result = await handler.execute(
      new GetCourseReviewsQuery(3, { page: 2, size: 5 } as GetCourseReviewsRequest),
    );

    expect(findAndCountSpy).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(2);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
  });

  it("returns an empty page when the course has no reviews", async () => {
    jest.spyOn(CourseRating, "findAndCount").mockResolvedValue([[], 0]);

    const result = await handler.execute(
      new GetCourseReviewsQuery(3, {} as GetCourseReviewsRequest),
    );

    expect(result.data).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(false);
  });
});
