import { UpdateGameHandler } from "@/features/home/game/commands/update-game/update-game.handler";
import { UpdateGameCommand } from "@/features/home/game/commands/update-game/update-game.command";
import { UpdateGameRequest } from "@/features/home/game/commands/update-game/update-game.request";
import { Game } from "@/features/home/entities/game/game.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("UpdateGameHandler", () => {
  let handler: UpdateGameHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new UpdateGameHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  const makeGame = () => {
    const saveMock = jest.fn();
    const game = {
      id: 1,
      whitePlayerId: 1,
      blackPlayerId: 2,
      whiteScore: 1,
      blackScore: 0,
      gameType: GameType.Blitz,
      movesCount: 40,
      playedAt: new Date("2026-08-01"),
      save: saveMock,
    } as unknown as Game;
    saveMock.mockImplementation(() => Promise.resolve(game));
    return { game, saveMock };
  };

  it("updates a game on the happy path", async () => {
    const { game } = makeGame();
    jest.spyOn(Game, "findOneBy").mockResolvedValue(game);

    const payload: UpdateGameRequest = { whiteScore: 2, movesCount: 55 };
    const result = await handler.execute(new UpdateGameCommand(1, payload));

    expect(game.whiteScore).toBe(2);
    expect(game.movesCount).toBe(55);
    expect(result.whiteScore).toBe(2);
  });

  it("throws DoesNotExistException (404) when the game doesn't exist", async () => {
    jest.spyOn(Game, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateGameCommand(999, {})),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (404) when the new whitePlayerId doesn't exist", async () => {
    const { game, saveMock } = makeGame();
    jest.spyOn(Game, "findOneBy").mockResolvedValue(game);
    jest.spyOn(Player, "existsBy").mockResolvedValue(false);

    await expect(
      handler.execute(new UpdateGameCommand(1, { whitePlayerId: 99 })),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("invalidates the games list, filters, recent games and by-id cache on success", async () => {
    const { game } = makeGame();
    jest.spyOn(Game, "findOneBy").mockResolvedValue(game);

    await handler.execute(new UpdateGameCommand(1, { whiteScore: 2 }));

    expect(cache.del).toHaveBeenCalledWith("games:list");
    expect(cache.del).toHaveBeenCalledWith("games:filters");
    expect(cache.del).toHaveBeenCalledWith("games:recent");
    expect(cache.del).toHaveBeenCalledWith("games:1");
  });
});
