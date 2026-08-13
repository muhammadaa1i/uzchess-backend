import { CreateDifficultyHandler } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.handler";
import { CreateDifficultyCommand } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.command";
import { CreateDifficultyRequest } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.request";
import { Difficulty } from "@/features/library/entities/difficulty/difficulty.entity";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { DIFFICULTIES_LIST_CACHE_KEY } from "@/features/library/difficulty/difficulty.cache";

describe("CreateDifficultyHandler", () => {
  let handler: CreateDifficultyHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn().mockResolvedValue(undefined) };
    handler = new CreateDifficultyHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a difficulty with the uploaded icon path when the degree is unique", async () => {
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);
    const saveSpy = jest
      .spyOn(Difficulty, "save")
      .mockResolvedValue({ id: 1, degree: "Beginner", icon: "https://r2/icons/1.png" } as any);

    const result = await handler.execute(
      new CreateDifficultyCommand(
        { degree: "Beginner" } as CreateDifficultyRequest,
        "https://r2/icons/1.png",
      ),
    );

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ degree: "Beginner", icon: "https://r2/icons/1.png" }),
    );
    expect(result.id).toBe(1);
    expect(result.icon).toBe("https://r2/icons/1.png");
  });

  it("invalidates the difficulties list cache on success", async () => {
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(false);
    jest.spyOn(Difficulty, "save").mockResolvedValue({ id: 1, degree: "Beginner" } as any);

    await handler.execute(
      new CreateDifficultyCommand({ degree: "Beginner" } as CreateDifficultyRequest, "icon.png"),
    );

    expect(cache.del).toHaveBeenCalledWith(DIFFICULTIES_LIST_CACHE_KEY);
  });

  it("throws AlreadyExistException (409) when the degree already exists (case-insensitive)", async () => {
    jest.spyOn(Difficulty, "existsBy").mockResolvedValue(true);
    const saveSpy = jest.spyOn(Difficulty, "save");

    await expect(
      handler.execute(
        new CreateDifficultyCommand({ degree: "beginner" } as CreateDifficultyRequest, "icon.png"),
      ),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(saveSpy).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });
});
