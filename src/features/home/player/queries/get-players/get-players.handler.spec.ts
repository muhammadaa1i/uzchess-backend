import { GetPlayersHandler } from "@/features/home/player/queries/get-players/get-players.handler";
import { GetPlayersQuery } from "@/features/home/player/queries/get-players/get-players.query";
import { GetPlayersRequest } from "@/features/home/player/queries/get-players/get-players.request";
import { Player } from "@/features/home/entities/player/player.entity";

describe("GetPlayersHandler", () => {
  let handler: GetPlayersHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetPlayersHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached top players on a default (no-limit) query when a cache hit exists", async () => {
    cache.get.mockResolvedValue([{ id: 1, name: "Cached" }]);
    const findSpy = jest.spyOn(Player, "find");

    const payload: GetPlayersRequest = {};
    const result = await handler.execute(new GetPlayersQuery(payload));

    expect(result).toEqual([{ id: 1, name: "Cached" }]);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the top players ordered by classical rating desc, defaulting to top 5", async () => {
    const findSpy = jest.spyOn(Player, "find").mockResolvedValue([
      {
        id: 1,
        name: "Magnus",
        avatarUrl: null,
        classicalRating: 2830,
        classicalRatingChange: 12,
      },
    ] as any);

    const payload: GetPlayersRequest = {};
    const result = await handler.execute(new GetPlayersQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      order: { classicalRating: "DESC" },
      take: 5,
    });
    expect(result).toHaveLength(1);
    expect(cache.set).toHaveBeenCalledWith("players:top", result);
  });

  it("respects a custom limit and does not use or populate the default cache", async () => {
    const findSpy = jest.spyOn(Player, "find").mockResolvedValue([]);

    const payload: GetPlayersRequest = { limit: 3 };
    await handler.execute(new GetPlayersQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      order: { classicalRating: "DESC" },
      take: 3,
    });
    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });
});
