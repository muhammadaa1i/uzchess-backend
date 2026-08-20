import { DeleteGameHandler } from "@/features/home/game/commands/delete-game/delete-game.handler";
import { DeleteGameCommand } from "@/features/home/game/commands/delete-game/delete-game.command";
import { Game } from "@/features/home/entities/game/game.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("DeleteGameHandler", () => {
  let handler: DeleteGameHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new DeleteGameHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes a game on the happy path", async () => {
    const game = { id: 1, whitePlayerId: 1, blackPlayerId: 2 };
    jest.spyOn(Game, "findOneBy").mockResolvedValue(game as any);
    const removeSpy = jest.spyOn(Game, "remove").mockResolvedValue(game as any);

    const result = await handler.execute(new DeleteGameCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(game);
    expect(result).toEqual({ message: "Game deleted successfully" });
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Game, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Game, "remove");

    await expect(
      handler.execute(new DeleteGameCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it("invalidates the games list, filters, recent games and by-id cache on success", async () => {
    const game = { id: 1, whitePlayerId: 1, blackPlayerId: 2 };
    jest.spyOn(Game, "findOneBy").mockResolvedValue(game as any);
    jest.spyOn(Game, "remove").mockResolvedValue(game as any);

    await handler.execute(new DeleteGameCommand(1));

    expect(cache.del).toHaveBeenCalledWith("games:list");
    expect(cache.del).toHaveBeenCalledWith("games:filters");
    expect(cache.del).toHaveBeenCalledWith("games:recent");
    expect(cache.del).toHaveBeenCalledWith("games:1");
  });
});
