import { CreateGameOfDayHandler } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.handler";
import { CreateGameOfDayCommand } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.command";
import { CreateGameOfDayRequest } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.request";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { GameType } from "@/core/enums/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("CreateGameOfDayHandler", () => {
  let handler: CreateGameOfDayHandler;

  beforeEach(() => {
    handler = new CreateGameOfDayHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  const payload: CreateGameOfDayRequest = {
    whitePlayerId: 1,
    blackPlayerId: 2,
    durationSeconds: 600,
    liveStartTime: "2026-08-14T17:00:00.000Z",
    gameType: GameType.Rapid,
    isActive: true,
    video: {},
    thumbnail: {},
  };

  it("creates a game-of-day and deactivates the previously active one", async () => {
    jest.spyOn(Player, "existsBy").mockResolvedValue(true);
    const updateSpy = jest
      .spyOn(GameOfDay, "update")
      .mockResolvedValue(undefined as any);
    jest.spyOn(GameOfDay, "create").mockReturnValue({
      id: 1,
      videoUrl: "video.mp4",
      thumbnailUrl: "thumb.png",
      durationSeconds: 600,
      gameType: GameType.Rapid,
      whitePlayerId: 1,
      blackPlayerId: 2,
      isActive: true,
    } as any);
    jest.spyOn(GameOfDay, "save").mockImplementation((g) => g);

    const result = await handler.execute(
      new CreateGameOfDayCommand(payload, "video.mp4", "thumb.png"),
    );

    expect(updateSpy).toHaveBeenCalledWith(
      { isActive: true },
      { isActive: false },
    );
    expect(result.isActive).toBe(true);
  });

  it("does not deactivate other rows when isActive is not set", async () => {
    jest.spyOn(Player, "existsBy").mockResolvedValue(true);
    const updateSpy = jest.spyOn(GameOfDay, "update");
    jest.spyOn(GameOfDay, "create").mockReturnValue({
      id: 1,
      isActive: false,
    } as any);
    jest.spyOn(GameOfDay, "save").mockImplementation((g) => g);

    await handler.execute(
      new CreateGameOfDayCommand(
        { ...payload, isActive: false },
        "video.mp4",
        "thumb.png",
      ),
    );

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the white player doesn't exist", async () => {
    jest.spyOn(Player, "existsBy").mockResolvedValueOnce(false);
    const saveSpy = jest.spyOn(GameOfDay, "save");

    await expect(
      handler.execute(
        new CreateGameOfDayCommand(payload, "video.mp4", "thumb.png"),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
