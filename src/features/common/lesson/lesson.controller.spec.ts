jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
  multerStorageOptions: jest.fn(),
}));

import { BadRequestException } from "@nestjs/common";
import { LessonController } from "@/features/common/lesson/lesson.controller";
import { CreateLessonRequest } from "@/features/common/lesson/commands/create-lesson/create-lesson.request";
import { CreateLessonCommand } from "@/features/common/lesson/commands/create-lesson/create-lesson.command";
import { UpdateLessonRequest } from "@/features/common/lesson/commands/update-lesson/update-lesson.request";
import { UpdateLessonCommand } from "@/features/common/lesson/commands/update-lesson/update-lesson.command";

describe("LessonController", () => {
  let controller: LessonController;
  let cmdBus: { execute: jest.Mock };
  let queryBus: { execute: jest.Mock };

  beforeEach(() => {
    cmdBus = { execute: jest.fn().mockResolvedValue({}) };
    queryBus = { execute: jest.fn().mockResolvedValue({}) };
    controller = new LessonController(cmdBus as any, queryBus as any);
  });

  describe("create", () => {
    const payload = { sectionId: 1, title: "L1", duration: 60, order: 1 } as CreateLessonRequest;

    it("throws BadRequestException (not an unhandled crash) when files is undefined", async () => {
      await expect(controller.create(payload, undefined as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(cmdBus.execute).not.toHaveBeenCalled();
    });

    it("throws BadRequestException cleanly when files is an empty object with no video", async () => {
      await expect(controller.create(payload, {} as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(cmdBus.execute).not.toHaveBeenCalled();
    });

    it("succeeds with a valid video file and no thumbnail", async () => {
      const files = { video: [{ path: "videos/v1.mp4" }] } as any;

      await controller.create(payload, files);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new CreateLessonCommand(payload, "videos/v1.mp4", undefined),
      );
    });

    it("succeeds with both video and thumbnail files", async () => {
      const files = {
        video: [{ path: "videos/v1.mp4" }],
        thumbnail: [{ path: "thumbs/t1.png" }],
      } as any;

      await controller.create(payload, files);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new CreateLessonCommand(payload, "videos/v1.mp4", "thumbs/t1.png"),
      );
    });
  });

  describe("update", () => {
    const payload = { title: "New title" } as UpdateLessonRequest;

    it("does not throw when files is undefined, and passes undefined paths through", async () => {
      await expect(controller.update(1, payload, undefined as any)).resolves.not.toThrow();

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new UpdateLessonCommand(1, payload, undefined, undefined),
      );
    });

    it("passes the right video/thumbnail paths through when files are provided", async () => {
      const files = {
        video: [{ path: "videos/v2.mp4" }],
        thumbnail: [{ path: "thumbs/t2.png" }],
      } as any;

      await controller.update(1, payload, files);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new UpdateLessonCommand(1, payload, "videos/v2.mp4", "thumbs/t2.png"),
      );
    });
  });
});
