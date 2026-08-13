jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteCourseHandler } from "@/features/common/courses/commands/delete-course/delete-course.handler";
import { DeleteCourseCommand } from "@/features/common/courses/commands/delete-course/delete-course.command";
import { Course } from "@/features/common/entities/course/course.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import {
  COURSES_LIST_CACHE_KEY,
  courseByIdCacheKey,
} from "@/features/common/courses/course.cache";

describe("DeleteCourseHandler", () => {
  let handler: DeleteCourseHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteCourseHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the course (relying on DB cascade for sections/lessons rows) and manually deletes cover, video and thumbnail files from storage", async () => {
    const course = {
      id: 1,
      cover: "cover.png",
      sections: [
        {
          id: 10,
          lessons: [
            { id: 100, video: "video1.mp4", thumbnail: "thumb1.png" },
            { id: 101, video: "video2.mp4", thumbnail: null },
          ],
        },
        {
          id: 11,
          lessons: [{ id: 102, video: "video3.mp4", thumbnail: "thumb3.png" }],
        },
      ],
    } as any;
    jest.spyOn(Course, "findOne").mockResolvedValue(course);
    const removeSpy = jest.spyOn(Course, "remove").mockResolvedValue(course);

    const result = await handler.execute(new DeleteCourseCommand(1));

    // Course.findOne is fetched with sections+lessons relations so the handler
    // can walk them for R2 cleanup after removal.
    expect(Course.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { sections: { lessons: true } },
    });
    // Course.remove is called with the whole course row — deleting it is what
    // triggers the DB-level cascade delete of section/lesson rows; the handler
    // itself does not issue separate deletes for those rows.
    expect(removeSpy).toHaveBeenCalledWith(course);

    // R2 objects are NOT covered by DB cascade, so the handler manually
    // deletes the cover plus every lesson's video/thumbnail.
    expect(deleteUploadedFile).toHaveBeenCalledWith("cover.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("video1.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("thumb1.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("video2.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("video3.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("thumb3.png");
    expect(deleteUploadedFile).toHaveBeenCalledTimes(6);

    expect(result.message).toBe("Course deleted successfully");
  });

  it("does not attempt to delete a lesson thumbnail that never existed", async () => {
    const course = {
      id: 1,
      cover: "cover.png",
      sections: [{ id: 10, lessons: [{ id: 100, video: "video1.mp4", thumbnail: null }] }],
    } as any;
    jest.spyOn(Course, "findOne").mockResolvedValue(course);
    jest.spyOn(Course, "remove").mockResolvedValue(course);

    await handler.execute(new DeleteCourseCommand(1));

    expect(deleteUploadedFile).toHaveBeenCalledWith("cover.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("video1.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledTimes(2);
  });

  it("handles a course with no sections at all", async () => {
    const course = { id: 1, cover: "cover.png", sections: [] } as any;
    jest.spyOn(Course, "findOne").mockResolvedValue(course);
    jest.spyOn(Course, "remove").mockResolvedValue(course);

    await handler.execute(new DeleteCourseCommand(1));

    expect(deleteUploadedFile).toHaveBeenCalledWith("cover.png");
    expect(deleteUploadedFile).toHaveBeenCalledTimes(1);
  });

  it("invalidates courses list and course-by-id caches on success", async () => {
    const course = { id: 1, cover: "cover.png", sections: [] } as any;
    jest.spyOn(Course, "findOne").mockResolvedValue(course);
    jest.spyOn(Course, "remove").mockResolvedValue(course);

    await handler.execute(new DeleteCourseCommand(1));

    expect(cache.del).toHaveBeenCalledWith(COURSES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(courseByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Course, "remove");

    await expect(handler.execute(new DeleteCourseCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });
});
