import { GetPlayersRankingHandler } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.handler";
import { GetPlayersRankingQuery } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.query";
import {
  GetPlayersRankingRequest,
  RankingSortBy,
} from "@/features/home/player/queries/get-players-ranking/get-players-ranking.request";
import { Player } from "@/features/home/entities/player/player.entity";
import { PlayerTitle } from "@/core/enums/player-title/player-title.enum";

describe("GetPlayersRankingHandler", () => {
  let handler: GetPlayersRankingHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makePlayer = (overrides: Partial<Player> = {}) =>
    ({
      id: 1,
      name: "Magnus Carlsen",
      avatarUrl: null,
      country: "NOR",
      title: PlayerTitle.GM,
      classicalRating: 2830,
      classicalRatingChange: 12,
      rapidRating: 2800,
      rapidRatingChange: null,
      blitzRating: 2820,
      blitzRatingChange: null,
      ...overrides,
    }) as unknown as Player;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetPlayersRankingHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached ranking on a default (no-filter) query when a cache hit exists", async () => {
    cache.get.mockResolvedValue({ totalCount: 1, data: [] });
    const findSpy = jest.spyOn(Player, "find");

    const result = await handler.execute(new GetPlayersRankingQuery({}));

    expect(result).toEqual({ totalCount: 1, data: [] });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("sorts by classical rating desc and defaults to page 1, size 10 when no payload given", async () => {
    const findSpy = jest.spyOn(Player, "find").mockResolvedValue([makePlayer()]);

    const payload: GetPlayersRankingRequest = {};
    const result = await handler.execute(new GetPlayersRankingQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      where: {},
      order: { classicalRating: "DESC" },
    });
    expect(result.currentPage).toBe(1);
    expect(result.totalCount).toBe(1);
    expect(result.data[0].rank).toBe(1);
    expect(cache.set).toHaveBeenCalledWith("players:ranking", result);
  });

  it("sorts by rapid rating when sortBy=rapid", async () => {
    const findSpy = jest.spyOn(Player, "find").mockResolvedValue([]);

    await handler.execute(
      new GetPlayersRankingQuery({ sortBy: RankingSortBy.Rapid }),
    );

    expect(findSpy).toHaveBeenCalledWith({
      where: {},
      order: { rapidRating: "DESC" },
    });
  });

  it("sorts by blitz rating when sortBy=blitz", async () => {
    const findSpy = jest.spyOn(Player, "find").mockResolvedValue([]);

    await handler.execute(
      new GetPlayersRankingQuery({ sortBy: RankingSortBy.Blitz }),
    );

    expect(findSpy).toHaveBeenCalledWith({
      where: {},
      order: { blitzRating: "DESC" },
    });
  });

  it("filters by country and title", async () => {
    const findSpy = jest.spyOn(Player, "find").mockResolvedValue([]);

    await handler.execute(
      new GetPlayersRankingQuery({ country: "UZ", title: PlayerTitle.IM }),
    );

    expect(findSpy).toHaveBeenCalledWith({
      where: { country: "UZ", title: PlayerTitle.IM },
      order: { classicalRating: "DESC" },
    });
  });

  it("paginates results and computes rank relative to the whole list, not the page", async () => {
    const players = Array.from({ length: 25 }, (_, i) =>
      makePlayer({ id: i + 1, name: `Player ${i + 1}` }),
    );
    jest.spyOn(Player, "find").mockResolvedValue(players);

    const result = await handler.execute(
      new GetPlayersRankingQuery({ page: 2, size: 10 }),
    );

    expect(result.data).toHaveLength(10);
    expect(result.data[0].id).toBe(11);
    expect(result.data[0].rank).toBe(11);
    expect(result.data[9].rank).toBe(20);
    expect(result.totalCount).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
  });

  it("reports hasPrevious=false on the first page and hasNext=false on the last page", async () => {
    const players = Array.from({ length: 5 }, (_, i) => makePlayer({ id: i + 1 }));
    jest.spyOn(Player, "find").mockResolvedValue(players);

    const firstPage = await handler.execute(
      new GetPlayersRankingQuery({ page: 1, size: 10 }),
    );
    expect(firstPage.hasPrevious).toBe(false);
    expect(firstPage.hasNext).toBe(false);
    expect(firstPage.data).toHaveLength(5);
  });

  it("returns an empty page with sane pagination flags when the page is past the end", async () => {
    const players = Array.from({ length: 5 }, (_, i) => makePlayer({ id: i + 1 }));
    jest.spyOn(Player, "find").mockResolvedValue(players);

    const result = await handler.execute(
      new GetPlayersRankingQuery({ page: 3, size: 5 }),
    );

    expect(result.data).toHaveLength(0);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
  });
});
