import { CreatePlayerHandler } from "@/features/home/player/commands/create-player/create-player.handler";
import { CreatePlayerCommand } from "@/features/home/player/commands/create-player/create-player.command";
import { CreatePlayerRequest } from "@/features/home/player/commands/create-player/create-player.request";
import { Player } from "@/features/home/entities/player/player.entity";
import { PlayerTitle } from "@/core/enums/player-title.enum";

describe("CreatePlayerHandler", () => {
  let handler: CreatePlayerHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CreatePlayerHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a player on the happy path", async () => {
    const createSpy = jest.spyOn(Player, "create").mockReturnValue({
      id: 1,
      name: "Magnus Carlsen",
      avatarUrl: "https://r2.example.com/players/avatar.png",
      country: "NOR",
      title: PlayerTitle.GM,
      classicalRating: 2830,
      classicalRatingChange: 12,
      rapidRating: 2800,
      rapidRatingChange: 5,
      blitzRating: 2880,
      blitzRatingChange: -3,
      rankChange: 3,
      birthDate: new Date("2000-01-01"),
    } as any);
    const saveSpy = jest.spyOn(Player, "save").mockImplementation((p) => p);

    const payload: CreatePlayerRequest = {
      name: "Magnus Carlsen",
      country: "NOR",
      title: PlayerTitle.GM,
      classicalRating: 2830,
      classicalRatingChange: 12,
      rapidRating: 2800,
      rapidRatingChange: 5,
      blitzRating: 2880,
      blitzRatingChange: -3,
      rankChange: 3,
      birthDate: "2000-01-01",
    };
    const result = await handler.execute(
      new CreatePlayerCommand(
        payload,
        "https://r2.example.com/players/avatar.png",
      ),
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Magnus Carlsen",
        avatarUrl: "https://r2.example.com/players/avatar.png",
        country: "NOR",
        title: PlayerTitle.GM,
        classicalRating: 2830,
        classicalRatingChange: 12,
        rapidRating: 2800,
        rapidRatingChange: 5,
        blitzRating: 2880,
        blitzRatingChange: -3,
        rankChange: 3,
        birthDate: new Date("2000-01-01"),
      }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(result.name).toBe("Magnus Carlsen");
    expect(result.classicalRating).toBe(2830);
    expect(result.rankChange).toBe(3);
    expect(result.birthDate).toEqual(new Date("2000-01-01"));
  });

  it("defaults avatarUrl, title and rating changes when not provided", async () => {
    jest.spyOn(Player, "create").mockReturnValue({
      id: 2,
      name: "New Player",
      avatarUrl: null,
      country: "USA",
      title: PlayerTitle.None,
      classicalRating: 1500,
      classicalRatingChange: null,
      rapidRating: 1500,
      rapidRatingChange: null,
      blitzRating: 1500,
      blitzRatingChange: null,
      rankChange: null,
      birthDate: null,
    } as any);
    jest.spyOn(Player, "save").mockImplementation((p) => p);

    const payload: CreatePlayerRequest = {
      name: "New Player",
      country: "USA",
      classicalRating: 1500,
      rapidRating: 1500,
      blitzRating: 1500,
    };
    const result = await handler.execute(
      new CreatePlayerCommand(payload, undefined),
    );

    expect(result.avatarUrl).toBeNull();
    expect(result.title).toBe(PlayerTitle.None);
    expect(result.classicalRatingChange).toBeNull();
    expect(result.rankChange).toBeNull();
    expect(result.birthDate).toBeNull();
  });

  it("invalidates the ranking, ranking-filters and top players cache on success", async () => {
    jest.spyOn(Player, "create").mockReturnValue({ id: 1 } as any);
    jest.spyOn(Player, "save").mockImplementation((p) => p);

    const payload: CreatePlayerRequest = {
      name: "New Player",
      country: "USA",
      classicalRating: 1500,
      rapidRating: 1500,
      blitzRating: 1500,
    };
    await handler.execute(new CreatePlayerCommand(payload, undefined));

    expect(cache.del).toHaveBeenCalledWith("players:ranking");
    expect(cache.del).toHaveBeenCalledWith("players:ranking-filters");
    expect(cache.del).toHaveBeenCalledWith("players:top");
  });
});
