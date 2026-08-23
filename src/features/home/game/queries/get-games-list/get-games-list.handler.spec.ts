import { GetGamesListHandler } from "@/features/home/game/queries/get-games-list/get-games-list.handler";
import { GetGamesListQuery } from "@/features/home/game/queries/get-games-list/get-games-list.query";
import {
  GamesListSortBy,
  GetGamesListRequest,
} from "@/features/home/game/queries/get-games-list/get-games-list.request";
import { Game } from "@/features/home/entities/game/game.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";

describe("GetGamesListHandler", () => {
  let handler: GetGamesListHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makePlayer = (overrides: Record<string, any> = {}) => ({
    id: 1,
    name: "Magnus Carlsen",
    avatarUrl: null,
    country: "NOR",
    classicalRating: 2830,
    rapidRating: 2800,
    blitzRating: 2900,
    birthDate: null,
    ...overrides,
  });

  const makeGame = (overrides: Record<string, any> = {}) =>
    ({
      id: 1,
      whitePlayerId: 1,
      blackPlayerId: 2,
      whitePlayer: makePlayer({ id: 1, name: "White Player", country: "NOR" }),
      blackPlayer: makePlayer({ id: 2, name: "Black Player", country: "USA" }),
      whiteScore: 1,
      blackScore: 0,
      gameType: GameType.Blitz,
      movesCount: 40,
      playedAt: new Date("2026-08-01"),
      ...overrides,
    }) as unknown as Game;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetGamesListHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached list on a default (no-filter) query when a cache hit exists", async () => {
    cache.get.mockResolvedValue({ totalCount: 1, data: [] });
    const findSpy = jest.spyOn(Game, "find");

    const result = await handler.execute(new GetGamesListQuery({}));

    expect(result).toEqual({ totalCount: 1, data: [] });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("sorts by playedAt desc by default and defaults to page 1, size 10 when no payload given", async () => {
    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({ id: 1, playedAt: new Date("2026-08-01") }),
      makeGame({ id: 2, playedAt: new Date("2026-08-05") }),
    ]);

    const payload: GetGamesListRequest = {};
    const result = await handler.execute(new GetGamesListQuery(payload));

    expect(result.currentPage).toBe(1);
    expect(result.totalCount).toBe(2);
    expect(result.data[0].id).toBe(2);
    expect(result.data[1].id).toBe(1);
    expect(cache.set).toHaveBeenCalledWith("games:list", result);
  });

  it("sorts by movesCount desc when sortBy=moves", async () => {
    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({ id: 1, movesCount: 20 }),
      makeGame({ id: 2, movesCount: 60 }),
    ]);

    const result = await handler.execute(
      new GetGamesListQuery({ sortBy: GamesListSortBy.Moves }),
    );

    expect(result.data[0].id).toBe(2);
    expect(result.data[1].id).toBe(1);
  });

  it("sorts alphabetically ascending by gameType when sortBy=gameType", async () => {
    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({ id: 1, gameType: GameType.Rapid }),
      makeGame({ id: 2, gameType: GameType.Blitz }),
      makeGame({ id: 3, gameType: GameType.Bullet }),
    ]);

    const result = await handler.execute(
      new GetGamesListQuery({ sortBy: GamesListSortBy.GameType }),
    );

    expect(result.data.map((g) => g.gameType)).toEqual([
      GameType.Blitz,
      GameType.Bullet,
      GameType.Rapid,
    ]);
  });

  it("filters by country, matching either white or black player", async () => {
    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({
        id: 1,
        whitePlayer: makePlayer({ id: 1, country: "UZB" }),
        blackPlayer: makePlayer({ id: 2, country: "USA" }),
      }),
      makeGame({
        id: 2,
        whitePlayer: makePlayer({ id: 3, country: "NOR" }),
        blackPlayer: makePlayer({ id: 4, country: "UZB" }),
      }),
      makeGame({
        id: 3,
        whitePlayer: makePlayer({ id: 5, country: "NOR" }),
        blackPlayer: makePlayer({ id: 6, country: "USA" }),
      }),
    ]);

    const result = await handler.execute(
      new GetGamesListQuery({ country: "UZB" }),
    );

    expect(result.data.map((g) => g.id).sort()).toEqual([1, 2]);
  });

  it("filters by age, matching either white or black player's calculated age", async () => {
    const now = new Date();
    const twentyYearsAgo = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
    const thirtyYearsAgo = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());

    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({
        id: 1,
        whitePlayer: makePlayer({ id: 1, birthDate: twentyYearsAgo }),
        blackPlayer: makePlayer({ id: 2, birthDate: thirtyYearsAgo }),
      }),
      makeGame({
        id: 2,
        whitePlayer: makePlayer({ id: 3, birthDate: thirtyYearsAgo }),
        blackPlayer: makePlayer({ id: 4, birthDate: twentyYearsAgo }),
      }),
      makeGame({
        id: 3,
        whitePlayer: makePlayer({ id: 5, birthDate: thirtyYearsAgo }),
        blackPlayer: makePlayer({ id: 6, birthDate: thirtyYearsAgo }),
      }),
    ]);

    const result = await handler.execute(new GetGamesListQuery({ age: 20 }));

    expect(result.data.map((g) => g.id).sort()).toEqual([1, 2]);
  });

  it("paginates results", async () => {
    const games = Array.from({ length: 25 }, (_, i) =>
      makeGame({ id: i + 1, playedAt: new Date(2026, 0, i + 1) }),
    );
    jest.spyOn(Game, "find").mockResolvedValue(games);

    const result = await handler.execute(
      new GetGamesListQuery({ page: 2, size: 10 }),
    );

    expect(result.data).toHaveLength(10);
    expect(result.totalCount).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.hasNext).toBe(true);
    expect(result.hasPrevious).toBe(true);
  });

  it("reports hasPrevious=false on the first page and hasNext=false on the last page", async () => {
    const games = Array.from({ length: 5 }, (_, i) => makeGame({ id: i + 1 }));
    jest.spyOn(Game, "find").mockResolvedValue(games);

    const firstPage = await handler.execute(
      new GetGamesListQuery({ page: 1, size: 10 }),
    );
    expect(firstPage.hasPrevious).toBe(false);
    expect(firstPage.hasNext).toBe(false);
    expect(firstPage.data).toHaveLength(5);
  });

  it("returns an empty page with sane pagination flags when the page is past the end", async () => {
    const games = Array.from({ length: 5 }, (_, i) => makeGame({ id: i + 1 }));
    jest.spyOn(Game, "find").mockResolvedValue(games);

    const result = await handler.execute(
      new GetGamesListQuery({ page: 3, size: 5 }),
    );

    expect(result.data).toHaveLength(0);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
    expect(result.hasPrevious).toBe(true);
  });

  it("picks the rating matching the game's gameType, falling back to classicalRating for bullet", async () => {
    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({ id: 1, gameType: GameType.Rapid }),
      makeGame({ id: 2, gameType: GameType.Bullet }),
    ]);

    const result = await handler.execute(new GetGamesListQuery({}));

    const rapidGame = result.data.find((g) => g.id === 1);
    const bulletGame = result.data.find((g) => g.id === 2);
    expect(rapidGame?.whitePlayerRating).toBe(2800);
    expect(bulletGame?.whitePlayerRating).toBe(2830);
  });
});
