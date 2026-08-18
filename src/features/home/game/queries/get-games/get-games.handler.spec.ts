import { GetGamesHandler } from "@/features/home/game/queries/get-games/get-games.handler";
import { GetGamesQuery } from "@/features/home/game/queries/get-games/get-games.query";
import { GetGamesRequest } from "@/features/home/game/queries/get-games/get-games.request";
import { Game } from "@/features/home/entities/game/game.entity";
import { GameType } from "@/core/enums/game-type.enum";

describe("GetGamesHandler", () => {
  let handler: GetGamesHandler;

  beforeEach(() => {
    handler = new GetGamesHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns games ordered by playedAt desc with flattened player summaries, defaulting to top 5", async () => {
    const findSpy = jest.spyOn(Game, "find").mockResolvedValue([
      {
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
      },
    ] as any);

    const payload: GetGamesRequest = {};
    const result = await handler.execute(new GetGamesQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      relations: { whitePlayer: true, blackPlayer: true },
      order: { playedAt: "DESC" },
      take: 5,
    });
    expect(result).toHaveLength(1);
    expect(result[0].whitePlayerName).toBe("Magnus Carlsen");
    expect(result[0].blackPlayerRating).toBe(2780);
  });

  it("respects a custom limit", async () => {
    const findSpy = jest.spyOn(Game, "find").mockResolvedValue([]);

    const payload: GetGamesRequest = { limit: 3 };
    await handler.execute(new GetGamesQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      relations: { whitePlayer: true, blackPlayer: true },
      order: { playedAt: "DESC" },
      take: 3,
    });
  });
});
