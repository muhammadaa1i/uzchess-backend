jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
  multerStorageOptions: jest.fn(),
}));

import { BadRequestException } from "@nestjs/common";
import { BookController } from "@/features/library/book/book.controller";
import { CreateBookRequest } from "@/features/library/book/commands/create-book/create-book.request";
import { CreateBookCommand } from "@/features/library/book/commands/create-book/create-book.command";
import { UpdateBookRequest } from "@/features/library/book/commands/update-book/update-book.request";
import { UpdateBookCommand } from "@/features/library/book/commands/update-book/update-book.command";

describe("BookController", () => {
  let controller: BookController;
  let cmdBus: { execute: jest.Mock };
  let queryBus: { execute: jest.Mock };

  beforeEach(() => {
    cmdBus = { execute: jest.fn().mockResolvedValue({}) };
    queryBus = { execute: jest.fn().mockResolvedValue({}) };
    controller = new BookController(cmdBus as any, queryBus as any);
  });

  describe("create", () => {
    const payload = {
      title: "Book",
      price: 100,
      description: "desc",
      pageCount: 10,
      publishedYear: 2020,
      categoryId: 1,
      difficultyId: 1,
      languageId: 1,
      authorIds: [1],
    } as CreateBookRequest;

    it("throws BadRequestException (not an unhandled crash) when cover is undefined", async () => {
      await expect(controller.create(payload, undefined as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(cmdBus.execute).not.toHaveBeenCalled();
    });

    it("dispatches CreateBookCommand with the cover path when a cover is provided", async () => {
      const cover = { path: "bookCovers/c1.png" } as Express.Multer.File;

      await controller.create(payload, cover);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new CreateBookCommand(payload, "bookCovers/c1.png"),
      );
    });
  });

  describe("update", () => {
    const payload = { title: "New title" } as UpdateBookRequest;

    it("does not throw when cover is undefined, and passes an undefined path through", async () => {
      await expect(controller.update(1, payload, undefined as any)).resolves.not.toThrow();

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new UpdateBookCommand(1, payload, undefined),
      );
    });

    it("passes the new cover path through when a cover is provided", async () => {
      const cover = { path: "bookCovers/c2.png" } as Express.Multer.File;

      await controller.update(1, payload, cover);

      expect(cmdBus.execute).toHaveBeenCalledWith(
        new UpdateBookCommand(1, payload, "bookCovers/c2.png"),
      );
    });
  });

  describe("delete", () => {
    it("dispatches DeleteBookCommand with the parsed id", async () => {
      await controller.delete(5);

      expect(cmdBus.execute).toHaveBeenCalled();
    });
  });

  describe("getAll / getById", () => {
    it("dispatches GetBooksQuery for getAll", async () => {
      const query = {} as any;
      await controller.getAll(query);
      expect(queryBus.execute).toHaveBeenCalled();
    });

    it("dispatches GetBooksByIdQuery for getById", async () => {
      await controller.getById(3);
      expect(queryBus.execute).toHaveBeenCalled();
    });
  });
});
