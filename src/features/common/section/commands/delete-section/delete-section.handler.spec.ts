jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteSectionHandler } from "@/features/common/section/commands/delete-section/delete-section.handler";
import { DeleteSectionCommand } from "@/features/common/section/commands/delete-section/delete-section.command";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeleteSectionHandler", () => {
  let handler: DeleteSectionHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteSectionHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the section (cascading its lessons via the DB FK) and cleans up each lesson's R2 files", async () => {
    const section = {
      id: 1,
      courseId: 5,
      lessons: [
        { id: 101, video: "video1.mp4", thumbnail: "thumb1.png" },
        { id: 102, video: "video2.mp4", thumbnail: null },
      ],
    } as any;
    const findOneSpy = jest.spyOn(CourseSection, "findOne").mockResolvedValue(section);
    const removeSpy = jest.spyOn(CourseSection, "remove").mockResolvedValue(section);

    const result = await handler.execute(new DeleteSectionCommand(1));

    expect(findOneSpy).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { lessons: true },
    });
    expect(removeSpy).toHaveBeenCalledWith(section);
    expect(deleteUploadedFile).toHaveBeenCalledWith("video1.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("thumb1.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("video2.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledTimes(3);
    expect(result.message).toBe("Section deleted successfully");
  });

  it("removes a section with no lessons without attempting any file cleanup", async () => {
    const section = { id: 1, courseId: 5, lessons: [] } as any;
    jest.spyOn(CourseSection, "findOne").mockResolvedValue(section);
    const removeSpy = jest.spyOn(CourseSection, "remove").mockResolvedValue(section);

    await handler.execute(new DeleteSectionCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(section);
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("invalidates the sections list, section-by-id, course-by-id and courses-list caches on success", async () => {
    const section = { id: 1, courseId: 5, lessons: [] } as any;
    jest.spyOn(CourseSection, "findOne").mockResolvedValue(section);
    jest.spyOn(CourseSection, "remove").mockResolvedValue(section);

    await handler.execute(new DeleteSectionCommand(1));

    expect(cache.del).toHaveBeenCalledWith("sections:course:5");
    expect(cache.del).toHaveBeenCalledWith("sections:1");
    expect(cache.del).toHaveBeenCalledWith("courses:5");
    expect(cache.del).toHaveBeenCalledWith("courses:list");
  });

  it("throws DoesNotExistException (404) when the section doesn't exist", async () => {
    jest.spyOn(CourseSection, "findOne").mockResolvedValue(null);
    const removeSpy = jest.spyOn(CourseSection, "remove");

    await expect(handler.execute(new DeleteSectionCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
