jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateLessonHandler } from "@/features/common/lesson/commands/update-lesson/update-lesson.handler";
import { UpdateLessonCommand } from "@/features/common/lesson/commands/update-lesson/update-lesson.command";
import { UpdateLessonRequest } from "@/features/common/lesson/commands/update-lesson/update-lesson.request";
import { CourseLesson } from "@/features/common/entities/section/course-lesson.entity";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("UpdateLessonHandler", () => {
  let handler: UpdateLessonHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeLesson = (overrides: Partial<CourseLesson> = {}) =>
    ({
      id: 1,
      sectionId: 1,
      title: "Old title",
      video: "old-video.mp4",
      thumbnail: "old-thumb.png",
      duration: 60,
      order: 1,
      isFree: true,
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as CourseLesson;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateLessonHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("only changes fields that were provided, leaving undefined fields alone", async () => {
    const lesson = makeLesson();
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);

    const payload = { title: "New title" } as UpdateLessonRequest;

    await handler.execute(new UpdateLessonCommand(1, payload, undefined, undefined));

    expect(lesson.title).toBe("New title");
    // untouched fields
    expect(lesson.duration).toBe(60);
    expect(lesson.order).toBe(1);
    expect(lesson.isFree).toBe(true);
    expect(lesson.video).toBe("old-video.mp4");
    expect(lesson.thumbnail).toBe("old-thumb.png");
  });

  it("applies isFree: false explicitly (undefined-check, not falsy-check)", async () => {
    const lesson = makeLesson({ isFree: true });
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);

    const payload = { isFree: false } as UpdateLessonRequest;

    await handler.execute(new UpdateLessonCommand(1, payload, undefined, undefined));

    expect(lesson.isFree).toBe(false);
  });

  it("replaces the video and deletes the old one from storage", async () => {
    const lesson = makeLesson({ video: "old-video.mp4" });
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);

    await handler.execute(
      new UpdateLessonCommand(1, {} as UpdateLessonRequest, "new-video.mp4", undefined),
    );

    expect(lesson.video).toBe("new-video.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("old-video.mp4");
  });

  it("replaces the thumbnail and deletes the old one from storage when one existed", async () => {
    const lesson = makeLesson({ thumbnail: "old-thumb.png" });
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);

    await handler.execute(
      new UpdateLessonCommand(1, {} as UpdateLessonRequest, undefined, "new-thumb.png"),
    );

    expect(lesson.thumbnail).toBe("new-thumb.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("old-thumb.png");
  });

  it("does not attempt to delete a thumbnail that never existed when one is newly added", async () => {
    const lesson = makeLesson({ thumbnail: null });
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(lesson);
    jest.spyOn(CourseSection, "findOneBy").mockResolvedValue({ id: 1, courseId: 5 } as any);

    await handler.execute(
      new UpdateLessonCommand(1, {} as UpdateLessonRequest, undefined, "new-thumb.png"),
    );

    expect(lesson.thumbnail).toBe("new-thumb.png");
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the lesson doesn't exist", async () => {
    jest.spyOn(CourseLesson, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateLessonCommand(999, {} as UpdateLessonRequest, undefined, undefined)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
