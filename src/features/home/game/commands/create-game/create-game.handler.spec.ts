import { CreateGameHandler } from "@/features/home/game/commands/create-game/create-game.handler";
import { CreateGameCommand } from "@/features/home/game/commands/create-game/create-game.command";
import { CreateGameRequest } from "@/features/home/game/commands/create-game/create-game.request";
import { Game } from "@/features/home/entities/game/game.entity";
import { Player } from "@/features/home/entities/player/player.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("CreateGameHandler", () => {
    let handler: CreateGameHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CreateGameHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  const payload: CreateGameRequest = {
    whitePlayerId: 1,
    blackPlayerId: 2,
    whiteScore: 1,
    blackScore: 0,
    gameType: GameType.Blitz,
    movesCount: 40,
    playedAt: "2026-08-01",
  };

  it("creates a game on the happy path", async () => {
    jest.spyOn(Player, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(Game, "create").mockReturnValue({
      id: 1,
      ...payload,
      playedAt: new Date(payload.playedAt),
    } as any);
    const saveSpy = jest
      .spyOn(Game, "save")
      .mockImplementation((g: any) => Promise.resolve(g));

    const result = await handler.execute(new CreateGameCommand(payload));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        whitePlayerId: 1,
        blackPlayerId: 2,
        gameType: GameType.Blitz,
      }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(result.whitePlayerId).toBe(1);
  });

  it("throws DoesNotExistException (404) when the white player doesn't exist", async () => {
    jest.spyOn(Player, "existsBy").mockResolvedValueOnce(false);
    const saveSpy = jest.spyOn(Game, "save");

    await expect(
      handler.execute(new CreateGameCommand(payload)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the black player doesn't exist", async () => {
    jest
      .spyOn(Player, "existsBy")
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const saveSpy = jest.spyOn(Game, "save");

    await expect(
      handler.execute(new CreateGameCommand(payload)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("invalidates the games list, filters and recent games cache on success", async () => {
    jest.spyOn(Player, "existsBy").mockResolvedValue(true);
    jest.spyOn(Game, "create").mockReturnValue({
      id: 1,
      ...payload,
      playedAt: new Date(payload.playedAt),
    } as any);
    jest.spyOn(Game, "save").mockImplementation((g: any) => Promise.resolve(g));

    await handler.execute(new CreateGameCommand(payload));

    expect(cache.del).toHaveBeenCalledWith("games:list");
    expect(cache.del).toHaveBeenCalledWith("games:filters");
    expect(cache.del).toHaveBeenCalledWith("games:recent");
  });
});
