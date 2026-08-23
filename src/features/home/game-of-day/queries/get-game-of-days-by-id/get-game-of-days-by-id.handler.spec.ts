import { GetGameOfDaysByIdHandler } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.handler";
import { GetGameOfDaysByIdQuery } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.query";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetGameOfDaysByIdHandler", () => {
  let handler: GetGameOfDaysByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetGameOfDaysByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue({ id: 1, whitePlayerName: "Cached" });
    const findSpy = jest.spyOn(GameOfDay, "findOne");

    const result = await handler.execute(new GetGameOfDaysByIdQuery(1));

    expect(result).toEqual({ id: 1, whitePlayerName: "Cached" });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the row with flattened player summaries on the happy path", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(GameOfDay, "findOne").mockResolvedValue({
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

    const result = await handler.execute(new GetGameOfDaysByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.whitePlayerName).toBe("Magnus Carlsen");
    expect(cache.set).toHaveBeenCalledWith("game-of-day:1", result);
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(GameOfDay, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new GetGameOfDaysByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
