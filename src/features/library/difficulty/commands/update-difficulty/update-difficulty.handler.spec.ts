jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateDifficultyHandler } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.handler";
import { UpdateDifficultyCommand } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.command";
import { UpdateDifficultyRequest } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.request";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";
import {
  DIFFICULTIES_LIST_CACHE_KEY,
  difficultyByIdCacheKey,
} from "@/features/library/difficulty/difficulty.cache";

describe("UpdateDifficultyHandler", () => {
  let handler: UpdateDifficultyHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new UpdateDifficultyHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates the degree when found and unique, without touching the icon when none is provided", async () => {
    const difficulty = { id: 1, degree: "Old", icon: "https://r2/icons/old.png", save: jest.fn() };
    difficulty.save.mockResolvedValue({ id: 1, degree: "New", icon: "https://r2/icons/old.png" });
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);

    const result = await handler.execute(
      new UpdateDifficultyCommand(1, { degree: "New" } as UpdateDifficultyRequest, undefined as any),
    );

    expect(difficulty.degree).toBe("New");
    expect(difficulty.save).toHaveBeenCalled();
    expect(deleteUploadedFile).not.toHaveBeenCalled();
    expect(result.degree).toBe("New");
  });

  it("replaces the icon and deletes the old R2 file when a new icon is uploaded", async () => {
    const difficulty = {
      id: 1,
      degree: "Beginner",
      icon: "https://r2/icons/old.png",
      save: jest.fn(),
    };
    difficulty.save.mockResolvedValue({
      id: 1,
      degree: "Beginner",
      icon: "https://r2/icons/new.png",
    });
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);

    const result = await handler.execute(
      new UpdateDifficultyCommand(
        1,
        {} as UpdateDifficultyRequest,
        "https://r2/icons/new.png",
      ),
    );

    expect(difficulty.icon).toBe("https://r2/icons/new.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("https://r2/icons/old.png");
    expect(result.icon).toBe("https://r2/icons/new.png");
  });

  it("invalidates the difficulties list and by-id caches on success", async () => {
    const difficulty = {
      id: 1,
      degree: "Old",
      icon: "old.png",
      save: jest.fn().mockResolvedValue({ id: 1, degree: "New", icon: "old.png" }),
    };
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);

    await handler.execute(
      new UpdateDifficultyCommand(1, { degree: "New" } as UpdateDifficultyRequest, undefined as any),
    );

    expect(cache.del).toHaveBeenCalledWith(DIFFICULTIES_LIST_CACHE_KEY);
    expect(cache.del).toHaveBeenCalledWith(difficultyByIdCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the difficulty doesn't exist", async () => {
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdateDifficultyCommand(999, { degree: "New" } as UpdateDifficultyRequest, undefined as any),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(deleteUploadedFile).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when another difficulty already has that degree", async () => {
    const difficulty = { id: 1, degree: "Old", icon: "old.png", save: jest.fn() };
    jest.spyOn(Difficulty, "findOneBy").mockResolvedValue(difficulty as any);
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);

    await expect(
      handler.execute(
        new UpdateDifficultyCommand(1, { degree: "Taken" } as UpdateDifficultyRequest, undefined as any),
      ),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(difficulty.save).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
