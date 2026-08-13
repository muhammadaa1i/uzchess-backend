import { DeleteRatingHandler } from "@/features/common/rating/commands/delete-rating/delete-rating.handler";
import { DeleteRatingCommand } from "@/features/common/rating/commands/delete-rating/delete-rating.command";
import { CourseRating } from "@/features/common/entities/rating/course-rating.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

describe("DeleteRatingHandler", () => {
  let handler: DeleteRatingHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteRatingHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the caller's own rating for the course", async () => {
    const rating: any = { id: 1, courseId: 5, userId: 9, score: 4 };
    const findSpy = jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(rating);
    const removeSpy = jest.spyOn(CourseRating, "remove").mockResolvedValue(rating);

    const result = await handler.execute(new DeleteRatingCommand(5, 9));

    expect(findSpy).toHaveBeenCalledWith({ courseId: 5, userId: 9 });
    expect(removeSpy).toHaveBeenCalledWith(rating);
    expect(result.message).toBe("Rating deleted successfully");
  });

  it("supports the admin-only delete-by-courseId-and-userId path (deleting another user's rating)", async () => {
    // The RatingController's admin-only route (`@Roles(Role.Admin) DELETE rate/:courseId/:userId`)
    // builds the same DeleteRatingCommand(courseId, userId) but with an arbitrary target userId
    // instead of the authenticated caller's id — the handler itself is userId-agnostic.
    const rating: any = { id: 2, courseId: 5, userId: 123, score: 2 };
    const findSpy = jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(rating);
    const removeSpy = jest.spyOn(CourseRating, "remove").mockResolvedValue(rating);

    const result = await handler.execute(new DeleteRatingCommand(5, 123));

    expect(findSpy).toHaveBeenCalledWith({ courseId: 5, userId: 123 });
    expect(removeSpy).toHaveBeenCalledWith(rating);
    expect(result.message).toBe("Rating deleted successfully");
  });

  it("invalidates the courses list and course-by-id caches on success", async () => {
    const rating: any = { id: 1, courseId: 5, userId: 9 };
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(rating);
    jest.spyOn(CourseRating, "remove").mockResolvedValue(rating);

    await handler.execute(new DeleteRatingCommand(5, 9));

    expect(cache.del).toHaveBeenCalledWith(COURSES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(courseByIdCacheKey(5));
  });

  it("throws DoesNotExistException (404) when no rating exists for that course/user pair", async () => {
    jest.spyOn(CourseRating, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(CourseRating, "remove");

    await expect(handler.execute(new DeleteRatingCommand(5, 9))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
