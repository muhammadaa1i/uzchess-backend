import { GetGamesFiltersHandler } from "@/features/home/game/queries/get-games-filters/get-games-filters.handler";
import { Game } from "@/features/home/entities/game/game.entity";
import { GameType } from "@/core/enums/game-type/game-type.enum";

describe("GetGamesFiltersHandler", () => {
  let handler: GetGamesFiltersHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makePlayer = (overrides: Record<string, any> = {}) => ({
    id: 1,
    name: "Player",
    avatarUrl: null,
    country: "NOR",
    classicalRating: 2830,
    birthDate: null,
    ...overrides,
  });

  const makeGame = (overrides: Record<string, any> = {}) =>
    ({
      id: 1,
      whitePlayerId: 1,
      blackPlayerId: 2,
      whitePlayer: makePlayer({ id: 1, country: "NOR" }),
      blackPlayer: makePlayer({ id: 2, country: "USA" }),
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
    handler = new GetGamesFiltersHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("dedupes countries and ages across white/black players and across multiple games sharing a player", async () => {
    const now = new Date();
    const twentyYearsAgo = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate());
    const thirtyYearsAgo = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());

    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({
        id: 1,
        whitePlayer: makePlayer({ id: 1, country: "NOR", birthDate: twentyYearsAgo }),
        blackPlayer: makePlayer({ id: 2, country: "USA", birthDate: thirtyYearsAgo }),
      }),
      makeGame({
        id: 2,
        // player 1 appears again, as black this time, in another game
        whitePlayer: makePlayer({ id: 3, country: "USA", birthDate: thirtyYearsAgo }),
        blackPlayer: makePlayer({ id: 1, country: "NOR", birthDate: twentyYearsAgo }),
      }),
    ]);

    const result = await handler.execute();

    expect(result.countries).toEqual(["NOR", "USA"]);
    expect(result.ages).toEqual([20, 30]);
  });

  it("returns empty lists when there are no games", async () => {
    jest.spyOn(Game, "find").mockResolvedValue([]);

    const result = await handler.execute();

    expect(result.countries).toEqual([]);
    expect(result.ages).toEqual([]);
  });

  it("excludes players with no birthDate from ages, without producing null/NaN entries", async () => {
    jest.spyOn(Game, "find").mockResolvedValue([
      makeGame({
        id: 1,
        whitePlayer: makePlayer({ id: 1, country: "NOR", birthDate: null }),
        blackPlayer: makePlayer({ id: 2, country: "USA", birthDate: null }),
      }),
    ]);

    const result = await handler.execute();

    expect(result.countries).toEqual(["NOR", "USA"]);
    expect(result.ages).toEqual([]);
  });

  it("returns the cached result when a cache hit exists", async () => {
    cache.get.mockResolvedValue({ countries: ["NOR"], ages: [20] });
    const findSpy = jest.spyOn(Game, "find");

    const result = await handler.execute();

    expect(result).toEqual({ countries: ["NOR"], ages: [20] });
    expect(findSpy).not.toHaveBeenCalled();
  });
});
