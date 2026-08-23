jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdatePlayerHandler } from "@/features/home/player/commands/update-player/update-player.handler";
import { UpdatePlayerCommand } from "@/features/home/player/commands/update-player/update-player.command";
import { UpdatePlayerRequest } from "@/features/home/player/commands/update-player/update-player.request";
import { Player } from "@/features/home/entities/player/player.entity";
import { Game } from "@/features/home/entities/game/game.entity";
import { PlayerTitle } from "@/core/enums/player-title/player-title.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("UpdatePlayerHandler", () => {
  let handler: UpdatePlayerHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new UpdatePlayerHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
    jest.spyOn(Game, "find").mockResolvedValue([]);
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates a player on the happy path", async () => {
    const player = {
      id: 1,
      name: "Old Name",
      avatarUrl: null,
      country: "USA",
      title: PlayerTitle.None,
      classicalRating: 2000,
      classicalRatingChange: null,
      rapidRating: 2000,
      rapidRatingChange: null,
      blitzRating: 2000,
      blitzRatingChange: null,
      save: jest.fn(),
    };
    player.save.mockImplementation(() => Promise.resolve(player));
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);

    const payload: UpdatePlayerRequest = {
      name: "New Name",
      classicalRating: 2100,
    };
    const result = await handler.execute(
      new UpdatePlayerCommand(1, payload, undefined),
    );

    expect(player.name).toBe("New Name");
    expect(player.classicalRating).toBe(2100);
    expect(player.save).toHaveBeenCalled();
    expect(result.name).toBe("New Name");
  });

  it("deletes the old avatar when a new one is uploaded", async () => {
    const player = {
      id: 1,
      name: "Player",
      avatarUrl: "https://r2.example.com/players/old.png",
      country: "USA",
      title: PlayerTitle.None,
      classicalRating: 2000,
      classicalRatingChange: null,
      rapidRating: 2000,
      rapidRatingChange: null,
      blitzRating: 2000,
      blitzRatingChange: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);

    const payload: UpdatePlayerRequest = {};
    await handler.execute(
      new UpdatePlayerCommand(
        1,
        payload,
        "https://r2.example.com/players/new.png",
      ),
    );

    expect(deleteUploadedFile).toHaveBeenCalledWith(
      "https://r2.example.com/players/old.png",
    );
    expect(player.avatarUrl).toBe("https://r2.example.com/players/new.png");
  });

  it("updates rankChange when provided", async () => {
    const player = {
      id: 1,
      name: "Player",
      avatarUrl: null,
      country: "USA",
      title: PlayerTitle.None,
      classicalRating: 2000,
      classicalRatingChange: null,
      rapidRating: 2000,
      rapidRatingChange: null,
      blitzRating: 2000,
      blitzRatingChange: null,
      rankChange: null,
      save: jest.fn(),
    };
    player.save.mockImplementation(() => Promise.resolve(player));
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);

    const payload: UpdatePlayerRequest = { rankChange: -4 };
    const result = await handler.execute(
      new UpdatePlayerCommand(1, payload, undefined),
    );

    expect(player.rankChange).toBe(-4);
    expect(result.rankChange).toBe(-4);
  });

  it("applies birthDate when explicitly provided", async () => {
    const player = {
      id: 1,
      name: "Player",
      avatarUrl: null,
      country: "USA",
      title: PlayerTitle.None,
      classicalRating: 2000,
      classicalRatingChange: null,
      rapidRating: 2000,
      rapidRatingChange: null,
      blitzRating: 2000,
      blitzRatingChange: null,
      rankChange: null,
      birthDate: null,
      save: jest.fn(),
    };
    player.save.mockImplementation(() => Promise.resolve(player));
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);

    await handler.execute(
      new UpdatePlayerCommand(1, { birthDate: "2000-01-01" }, undefined),
    );

    expect(player.birthDate).toEqual(new Date("2000-01-01"));
  });

  it("throws DoesNotExistException (404) when the player doesn't exist", async () => {
    jest.spyOn(Player, "findOneBy").mockResolvedValue(null);

    const payload: UpdatePlayerRequest = { name: "New Name" };
    await expect(
      handler.execute(new UpdatePlayerCommand(999, payload, undefined)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("invalidates the ranking, ranking-filters, top players and by-id cache on success", async () => {
    const player = {
      id: 1,
      name: "Old Name",
      avatarUrl: null,
      country: "USA",
      title: PlayerTitle.None,
      classicalRating: 2000,
      classicalRatingChange: null,
      rapidRating: 2000,
      rapidRatingChange: null,
      blitzRating: 2000,
      blitzRatingChange: null,
      save: jest.fn(),
    };
    player.save.mockImplementation(() => Promise.resolve(player));
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);

    const payload: UpdatePlayerRequest = { name: "New Name" };
    await handler.execute(new UpdatePlayerCommand(1, payload, undefined));

    expect(cache.del).toHaveBeenCalledWith("players:ranking");
    expect(cache.del).toHaveBeenCalledWith("players:ranking-filters");
    expect(cache.del).toHaveBeenCalledWith("players:top");
    expect(cache.del).toHaveBeenCalledWith("players:1");
  });

  it("also invalidates games list/filters/recent caches and the byId cache of every game referencing this player, since games denormalize player name/avatar/rating", async () => {
    const player = {
      id: 1,
      name: "Old Name",
      avatarUrl: null,
      country: "USA",
      title: PlayerTitle.None,
      classicalRating: 2000,
      classicalRatingChange: null,
      rapidRating: 2000,
      rapidRatingChange: null,
      blitzRating: 2000,
      blitzRatingChange: null,
      save: jest.fn(),
    };
    player.save.mockImplementation(() => Promise.resolve(player));
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);
    jest
      .spyOn(Game, "find")
      .mockResolvedValue([{ id: 10 }, { id: 11 }] as any);

    const payload: UpdatePlayerRequest = { name: "New Name" };
    await handler.execute(new UpdatePlayerCommand(1, payload, undefined));

    expect(cache.del).toHaveBeenCalledWith("games:list");
    expect(cache.del).toHaveBeenCalledWith("games:filters");
    expect(cache.del).toHaveBeenCalledWith("games:recent");
    expect(cache.del).toHaveBeenCalledWith("games:10");
    expect(cache.del).toHaveBeenCalledWith("games:11");
  });
});
