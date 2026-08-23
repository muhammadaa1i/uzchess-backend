import { GetPlayersByIdHandler } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.handler";
import { GetPlayersByIdQuery } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { PlayerTitle } from "@/core/enums/player-title/player-title.enum";

describe("GetPlayersByIdHandler", () => {
  let handler: GetPlayersByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetPlayersByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue({ id: 1, name: "Cached" });
    const findSpy = jest.spyOn(Player, "findOneBy");

    const result = await handler.execute(new GetPlayersByIdQuery(1));

    expect(result).toEqual({ id: 1, name: "Cached" });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the player on the happy path", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Player, "findOneBy").mockResolvedValue({
      id: 1,
      name: "Magnus Carlsen",
      avatarUrl: null,
      classicalRating: 2830,
      classicalRatingChange: 12,
    } as any);

    const result = await handler.execute(new GetPlayersByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.name).toBe("Magnus Carlsen");
    expect(cache.set).toHaveBeenCalledWith("players:1", result);
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Player, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetPlayersByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("exposes country, title, rapidRating and blitzRating so the detail view isn't missing fields present on create/update responses", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Player, "findOneBy").mockResolvedValue({
      id: 1,
      name: "Magnus Carlsen",
      avatarUrl: null,
      country: "NOR",
      title: PlayerTitle.Gm,
      classicalRating: 2830,
      classicalRatingChange: 12,
      rapidRating: 2800,
      rapidRatingChange: -5,
      blitzRating: 2880,
      blitzRatingChange: 3,
      rankChange: 1,
      birthDate: null,
    } as any);

    const result = await handler.execute(new GetPlayersByIdQuery(1));

    expect(result.country).toBe("NOR");
    expect(result.title).toBe(PlayerTitle.Gm);
    expect(result.rapidRating).toBe(2800);
    expect(result.rapidRatingChange).toBe(-5);
    expect(result.blitzRating).toBe(2880);
    expect(result.blitzRatingChange).toBe(3);
  });
});
