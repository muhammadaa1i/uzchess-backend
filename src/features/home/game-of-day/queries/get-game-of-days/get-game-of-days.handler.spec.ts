import { GetGameOfDaysHandler } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.handler";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";

describe("GetGameOfDaysHandler", () => {
  let handler: GetGameOfDaysHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetGameOfDaysHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue([{ id: 1, whitePlayerName: "Cached" }]);
    const findSpy = jest.spyOn(GameOfDay, "find");

    const result = await handler.execute();

    expect(result).toEqual([{ id: 1, whitePlayerName: "Cached" }]);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns all game-of-day rows with flattened player summaries", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest.spyOn(GameOfDay, "find").mockResolvedValue([
      {
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
      },
    ] as any);

    const result = await handler.execute();

    expect(findSpy).toHaveBeenCalledWith({
      relations: { whitePlayer: true, blackPlayer: true },
      order: { createdAt: "DESC" },
    });
    expect(result).toHaveLength(1);
    expect(result[0].whitePlayerName).toBe("Magnus Carlsen");
    expect(cache.set).toHaveBeenCalledWith("game-of-day:list", result);
  });
});
