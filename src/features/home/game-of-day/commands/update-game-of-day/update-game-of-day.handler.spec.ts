jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateGameOfDayHandler } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.handler";
import { UpdateGameOfDayCommand } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.command";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("UpdateGameOfDayHandler", () => {
  let handler: UpdateGameOfDayHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new UpdateGameOfDayHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  const makeGameOfDay = () => {
    const gameOfDay = {
      id: 1,
      videoUrl: "old-video.mp4",
      thumbnailUrl: "old-thumb.png",
      durationSeconds: 300,
      gameType: GameType.Rapid,
      whitePlayerId: 1,
      blackPlayerId: 2,
      isActive: false,
      save: jest.fn(),
    } as unknown as GameOfDay;
    (gameOfDay.save as jest.Mock).mockImplementation(() =>
      Promise.resolve(gameOfDay),
    );
    return gameOfDay;
  };

  it("throws DoesNotExistException (404) when the row doesn't exist", async () => {
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdateGameOfDayCommand(999, {}, undefined, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("deactivates other active rows when set to isActive: true", async () => {
    const gameOfDay = makeGameOfDay();
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(gameOfDay);
    jest.spyOn(GameOfDay, "find").mockResolvedValue([{ id: 2 }] as any);
    const updateSpy = jest
      .spyOn(GameOfDay, "update")
      .mockResolvedValue(undefined as any);

    await handler.execute(
      new UpdateGameOfDayCommand(1, { isActive: true }, undefined, undefined),
    );

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
      { isActive: false },
    );
    expect(gameOfDay.isActive).toBe(true);
  });

  it("also invalidates the byId cache of every row it deactivates, so a stale isActive:true doesn't linger", async () => {
    const gameOfDay = makeGameOfDay();
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(gameOfDay);
    jest
      .spyOn(GameOfDay, "find")
      .mockResolvedValue([{ id: 2 }, { id: 3 }] as any);
    jest.spyOn(GameOfDay, "update").mockResolvedValue(undefined as any);

    await handler.execute(
      new UpdateGameOfDayCommand(1, { isActive: true }, undefined, undefined),
    );

    expect(cache.del).toHaveBeenCalledWith("game-of-day:2");
    expect(cache.del).toHaveBeenCalledWith("game-of-day:3");
  });

  it("updates liveStartTime when provided", async () => {
    const gameOfDay = makeGameOfDay();
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(gameOfDay);

    await handler.execute(
      new UpdateGameOfDayCommand(
        1,
        { liveStartTime: "2026-08-14T18:30:00.000Z" },
        undefined,
        undefined,
      ),
    );

    expect(gameOfDay.liveStartTime).toEqual(
      new Date("2026-08-14T18:30:00.000Z"),
    );
  });

  it("replaces video and thumbnail and deletes the old files", async () => {
    const gameOfDay = makeGameOfDay();
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(gameOfDay);

    await handler.execute(
      new UpdateGameOfDayCommand(1, {}, "new-video.mp4", "new-thumb.png"),
    );

    expect(gameOfDay.videoUrl).toBe("new-video.mp4");
    expect(gameOfDay.thumbnailUrl).toBe("new-thumb.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("old-video.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("old-thumb.png");
  });

  it("invalidates the active, list and by-id cache on success", async () => {
    const gameOfDay = makeGameOfDay();
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(gameOfDay);

    await handler.execute(
      new UpdateGameOfDayCommand(1, { durationSeconds: 400 }, undefined, undefined),
    );

    expect(cache.del).toHaveBeenCalledWith("game-of-day:active");
    expect(cache.del).toHaveBeenCalledWith("game-of-day:list");
    expect(cache.del).toHaveBeenCalledWith("game-of-day:1");
  });
});
