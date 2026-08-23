import { GetActiveGameOfDayHandler } from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.handler";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetActiveGameOfDayHandler", () => {
  let handler: GetActiveGameOfDayHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetActiveGameOfDayHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue({ id: 1, whitePlayerName: "Cached" });
    const findSpy = jest.spyOn(GameOfDay, "findOne");

    const result = await handler.execute();

    expect(result).toEqual({ id: 1, whitePlayerName: "Cached" });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the active row on the happy path", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest.spyOn(GameOfDay, "findOne").mockResolvedValue({
      id: 1,
      videoUrl: "video.mp4",
      thumbnailUrl: "thumb.png",
      durationSeconds: 300,
      gameType: GameType.Rapid,
      whitePlayerId: 1,
      blackPlayerId: 2,
      whitePlayer: { name: "Magnus Carlsen", avatarUrl: null, classicalRating: 2830 },
      blackPlayer: { name: "Hikaru Nakamura", avatarUrl: null, classicalRating: 2780 },
      isActive: true,
    } as any);

    const result = await handler.execute();

    expect(findSpy).toHaveBeenCalledWith({
      where: { isActive: true },
      relations: { whitePlayer: true, blackPlayer: true },
    });
    expect(result.whitePlayerName).toBe("Magnus Carlsen");
    expect(cache.set).toHaveBeenCalledWith("game-of-day:active", result);
  });

  it("throws DoesNotExistException (404) when there is no active row", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(GameOfDay, "findOne").mockResolvedValue(null);

    await expect(handler.execute()).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
  });
});
