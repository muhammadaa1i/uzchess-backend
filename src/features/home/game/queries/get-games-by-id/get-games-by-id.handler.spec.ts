import { GetGamesByIdHandler } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.handler";
import { GetGamesByIdQuery } from "@/features/home/game/queries/get-games-by-id/get-games-by-id.query";
import { Game } from "@/features/home/entities/game/game.entity";
import { GameType } from "@/core/enums/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetGamesByIdHandler", () => {
  let handler: GetGamesByIdHandler;

  beforeEach(() => {
    handler = new GetGamesByIdHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the game with flattened player summaries on the happy path", async () => {
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
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Game, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new GetGamesByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
