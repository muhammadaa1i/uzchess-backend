jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteLessonHandler } from "@/features/common/lesson/commands/delete-lesson/delete-lesson.handler";
import { DeleteLessonCommand } from "@/features/common/lesson/commands/delete-lesson/delete-lesson.command";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeleteLessonHandler", () => {
  let handler: DeleteLessonHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteLessonHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the lesson and deletes its video and thumbnail from storage", async () => {
    const lesson = {
      id: 1,
      sectionId: 1,
      video: "video.mp4",
      thumbnail: "thumb.png",
    } as any;
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);
    const removeSpy = jest.spyOn(CourseLesson, "remove").mockResolvedValue(lesson);

    const result = await handler.execute(new DeleteLessonCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(lesson);
    expect(deleteUploadedFile).toHaveBeenCalledWith("video.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("thumb.png");
    expect(result.message).toBe("Lesson deleted successfully");
  });

  it("does not attempt to delete a thumbnail that never existed", async () => {
    const lesson = { id: 1, sectionId: 1, video: "video.mp4", thumbnail: null } as any;
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);
    jest.spyOn(CourseLesson, "remove").mockResolvedValue(lesson);

    await handler.execute(new DeleteLessonCommand(1));

    expect(deleteUploadedFile).toHaveBeenCalledTimes(1);
    expect(deleteUploadedFile).toHaveBeenCalledWith("video.mp4");
  });

  it("invalidates lesson list, lesson-by-id, course-by-id and courses-list caches", async () => {
    const lesson = { id: 1, sectionId: 1, video: "video.mp4", thumbnail: null } as any;
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);
    jest.spyOn(CourseLesson, "remove").mockResolvedValue(lesson);

    await handler.execute(new DeleteLessonCommand(1));

    expect(cache.del).toHaveBeenCalledWith("lessons:section:1");
    expect(cache.del).toHaveBeenCalledWith("lessons:1");
    expect(cache.del).toHaveBeenCalledWith("courses:list");
    expect(cache.del).toHaveBeenCalledWith("courses:5");
  });

  it("throws DoesNotExistException (404) when the lesson doesn't exist", async () => {
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(CourseLesson, "remove");

    await expect(handler.execute(new DeleteLessonCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });
});
