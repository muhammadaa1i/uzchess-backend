jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeletePlayerHandler } from "@/features/home/player/commands/delete-player/delete-player.handler";
import { DeletePlayerCommand } from "@/features/home/player/commands/delete-player/delete-player.command";
import { Player } from "@/features/home/entities/player/player.entity";
import { Game } from "@/features/home/entities/game/game.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeletePlayerHandler", () => {
  let handler: DeletePlayerHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new DeletePlayerHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
    jest.spyOn(Game, "find").mockResolvedValue([]);
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes a player and its avatar on the happy path", async () => {
    const player = {
      id: 1,
      name: "Magnus",
      avatarUrl: "https://r2.example.com/players/avatar.png",
    };
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);
    const removeSpy = jest
      .spyOn(Player, "remove")
      .mockResolvedValue(player as any);

    const result = await handler.execute(new DeletePlayerCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(player);
    expect(deleteUploadedFile).toHaveBeenCalledWith(
      "https://r2.example.com/players/avatar.png",
    );
    expect(result).toEqual({ message: "Player deleted successfully" });
  });

  it("skips avatar deletion when the player has no avatar", async () => {
    const player = { id: 1, name: "Magnus", avatarUrl: null };
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);
    jest.spyOn(Player, "remove").mockResolvedValue(player as any);

    await handler.execute(new DeletePlayerCommand(1));

    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Player, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Player, "remove");

    await expect(
      handler.execute(new DeletePlayerCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it("invalidates the ranking, ranking-filters, top players and by-id cache on success", async () => {
    const player = { id: 1, name: "Magnus", avatarUrl: null };
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);
    jest.spyOn(Player, "remove").mockResolvedValue(player as any);

    await handler.execute(new DeletePlayerCommand(1));

    expect(cache.del).toHaveBeenCalledWith("players:ranking");
    expect(cache.del).toHaveBeenCalledWith("players:ranking-filters");
    expect(cache.del).toHaveBeenCalledWith("players:top");
    expect(cache.del).toHaveBeenCalledWith("players:1");
  });

  it("also invalidates games list/filters/recent caches and the byId cache of every game that referenced this player, since those games cascade-delete with it", async () => {
    const player = { id: 1, name: "Magnus", avatarUrl: null };
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);
    jest.spyOn(Player, "remove").mockResolvedValue(player as any);
    jest
      .spyOn(Game, "find")
      .mockResolvedValue([{ id: 20 }, { id: 21 }] as any);

    await handler.execute(new DeletePlayerCommand(1));

    expect(cache.del).toHaveBeenCalledWith("games:list");
    expect(cache.del).toHaveBeenCalledWith("games:filters");
    expect(cache.del).toHaveBeenCalledWith("games:recent");
    expect(cache.del).toHaveBeenCalledWith("games:20");
    expect(cache.del).toHaveBeenCalledWith("games:21");
  });
});
