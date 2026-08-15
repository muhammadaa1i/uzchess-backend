import { GetRankingFiltersHandler } from "@/features/home/player/queries/get-ranking-filters/get-ranking-filters.handler";
import { Player } from "@/features/home/entities/player/player.entity";
import { PlayerTitle } from "@/core/enums/player-title.enum";

describe("GetRankingFiltersHandler", () => {
  let handler: GetRankingFiltersHandler;

  const mockDistinctCountries = (rows: Array<{ country: string }>) => {
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(rows),
    };
    jest.spyOn(Player, "createQueryBuilder").mockReturnValue(queryBuilder);
    return queryBuilder;
  };

  beforeEach(() => {
    handler = new GetRankingFiltersHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns distinct countries currently used by players, ordered ascending", async () => {
    mockDistinctCountries([{ country: "NOR" }, { country: "UZB" }]);

    const result = await handler.execute();

    expect(result.countries).toEqual(["NOR", "UZB"]);
  });

  it("returns the full set of player titles", async () => {
    mockDistinctCountries([]);

    const result = await handler.execute();

    expect(result.titles).toEqual(Object.values(PlayerTitle));
  });

  it("returns an empty countries list when no players exist", async () => {
    mockDistinctCountries([]);

    const result = await handler.execute();

    expect(result.countries).toEqual([]);
  });
});
