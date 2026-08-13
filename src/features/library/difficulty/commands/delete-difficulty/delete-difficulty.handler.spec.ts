jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteDifficultyHandler } from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.handler";
import { DeleteDifficultyCommand } from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.command";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Course } from "@/features/common/entities/course/course.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { ConflictException } from "@nestjs/common";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import {
  DIFFICULTIES_LIST_CACHE_KEY,
  difficultyByIdCacheKey,
} from "@/features/library/difficulty/difficulty.cache";

describe("DeleteDifficultyHandler", () => {
  let handler: DeleteDifficultyHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new DeleteDifficultyHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the difficulty and deletes its R2 icon when not referenced by any book or course", async () => {
    const difficulty = { id: 1, degree: "Beginner", icon: "https://r2/icons/1.png" };
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const removeSpy = jest.spyOn(Difficulty, "remove").mockResolvedValue(difficulty as any);

    const result = await handler.execute(new DeleteDifficultyCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(difficulty);
    expect(deleteUploadedFile).toHaveBeenCalledWith("https://r2/icons/1.png");
    expect(result.message).toBe("Difficulty deleted successfully");
  });

  it("invalidates the difficulties list and by-id caches on success", async () => {
    const difficulty = { id: 1, degree: "Beginner", icon: "icon.png" };
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    jest.spyOn(Difficulty, "remove").mockResolvedValue(difficulty as any);

    await handler.execute(new DeleteDifficultyCommand(1));

    expect(cache.del).toHaveBeenCalledWith(DIFFICULTIES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(difficultyByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the difficulty doesn't exist", async () => {
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(null);
    const bookExistsSpy = jest.spyOn(Book, "existsBy");
    const courseExistsSpy = jest.spyOn(Course, "existsBy");
    const removeSpy = jest.spyOn(Difficulty, "remove");

    await expect(handler.execute(new DeleteDifficultyCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(bookExistsSpy).not.toHaveBeenCalled();
    expect(courseExistsSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws a 409 ConflictException when a book still references the difficulty", async () => {
    const difficulty = { id: 1, degree: "Beginner", icon: "icon.png" };
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    const bookExistsSpy = jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    const courseExistsSpy = jest.spyOn(Course, "existsBy").mockResolvedValue(false);
    const removeSpy = jest.spyOn(Difficulty, "remove");

    await expect(handler.execute(new DeleteDifficultyCommand(1))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(bookExistsSpy).toHaveBeenCalledWith({ difficultyId: 1 });
    expect(courseExistsSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("throws a 409 ConflictException when a course still references the difficulty (not just books)", async () => {
    const difficulty = { id: 1, degree: "Beginner", icon: "icon.png" };
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    const bookExistsSpy = jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    const courseExistsSpy = jest.spyOn(Course, "existsBy").mockResolvedValue(true);
    const removeSpy = jest.spyOn(Difficulty, "remove");

    await expect(handler.execute(new DeleteDifficultyCommand(1))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(courseExistsSpy).toHaveBeenCalledWith({ difficultyId: 1 });
    expect(removeSpy).not.toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });
});
