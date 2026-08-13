jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
  multerStorageOptions: jest.fn(),
}));

import { BadRequestException } from "@nestjs/common";
import { CourseController } from "@/features/common/courses/course.controller";
import { CreateCourseRequest } from "@/features/common/courses/commands/create-course/create-course.request";
import { CreateCourseCommand } from "@/features/common/courses/commands/create-course/create-course.command";
import { UpdateCourseRequest } from "@/features/common/courses/commands/update-course/update-course.request";
import { UpdateCourseCommand } from "@/features/common/courses/commands/update-course/update-course.command";

describe("CourseController", () => {
  let controller: CourseController;
  let cmdBus: { execute: jest.Mock };
  let queryBus: { execute: jest.Mock };

  beforeEach(() => {
    cmdBus = { execute: jest.fn().mockResolvedValue({}) };
    queryBus = { execute: jest.fn().mockResolvedValue({}) };
    controller = new CourseController(cmdBus as any, queryBus as any);
  });

  describe("create", () => {
    const payload = {
      title: "Course 1",
      price: 1000,
      description: "desc",
      categoryId: 1,
      difficultyId: 1,
      languageId: 1,
      authorIds: [1],
    } as CreateCourseRequest;

    it("throws BadRequestException (not an unhandled crash) when cover is undefined", async () => {
      await expect(controller.create(payload, undefined as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(cmdBus.execute).not.toHaveBeenCalled();
    });

    it("throws BadRequestException cleanly when cover is null", async () => {
      await expect(controller.create(payload, null as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(cmdBus.execute).not.toHaveBeenCalled();
    });

    it("succeeds and dispatches CreateCourseCommand with the cover path when a cover is provided", async () => {
      const cover = { path: "courseCovers/c1.png" } as Express.Multer.File;

      await controller.create(payload, cover);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new CreateCourseCommand(payload, "courseCovers/c1.png"),
      );
    });
  });

  describe("update", () => {
    const payload = { title: "New title" } as UpdateCourseRequest;

    it("does not throw when cover is undefined, and passes undefined coverPath through (cover is optional on update)", async () => {
      await expect(controller.update(1, payload, undefined as any)).resolves.not.toThrow();

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new UpdateCourseCommand(1, payload, undefined),
      );
    });

    it("passes the cover path through when a new cover is provided", async () => {
      const cover = { path: "courseCovers/c2.png" } as Express.Multer.File;

      await controller.update(1, payload, cover);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new UpdateCourseCommand(1, payload, "courseCovers/c2.png"),
      );
    });
  });

  describe("delete", () => {
    it("dispatches DeleteCourseCommand with the parsed id", async () => {
      await controller.delete(7);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7 }),
      );
    });
  });
});
