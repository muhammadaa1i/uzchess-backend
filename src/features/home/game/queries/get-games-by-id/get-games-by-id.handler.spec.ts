import { GetGamesByIdHandler } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.handler";
import { GetGamesByIdQuery } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.query";
import { Game } from "@/features/home/entities/game/game.entity";
import { GameType } from "@/core/enums/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetGamesByIdHandler", () => {
  let handler: GetGamesByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetGamesByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue({ id: 1, whitePlayerName: "Cached" });
    const findSpy = jest.spyOn(Game, "findOne");

    const result = await handler.execute(new GetGamesByIdQuery(1));

    expect(result).toEqual({ id: 1, whitePlayerName: "Cached" });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the game with flattened player summaries on the happy path", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Game, "findOne").mockResolvedValue({
      id: 1,
      whitePlayerId: 1,
      blackPlayerId: 2,
      whitePlayer: { name: "Magnus Carlsen", avatarUrl: null, classicalRating: 2830 },
      blackPlayer: { name: "Hikaru Nakamura", avatarUrl: null, classicalRating: 2780 },
      whiteScore: 1,
      blackScore: 0,
      gameType: GameType.Blitz,
      movesCount: 40,
      playedAt: new Date("2026-08-01"),
    } as any);

    const result = await handler.execute(new GetGamesByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.whitePlayerName).toBe("Magnus Carlsen");
    expect(cache.set).toHaveBeenCalledWith("games:1", result);
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Game, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new GetGamesByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
