import { DeleteGameHandler } from "@/features/home/game/commands/delete-game/delete-game.handler";
import { DeleteGameCommand } from "@/features/home/game/commands/delete-game/delete-game.command";
import { Game } from "@/features/home/entities/game/game.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("DeleteGameHandler", () => {
  let handler: DeleteGameHandler;

  beforeEach(() => {
    handler = new DeleteGameHandler();
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
});
