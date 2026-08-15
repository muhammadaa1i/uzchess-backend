import { GetPlayersHandler } from "@/features/home/player/queries/get-players/get-players.handler";
import { GetPlayersQuery } from "@/features/home/player/queries/get-players/get-players.query";
import { GetPlayersRequest } from "@/features/home/player/queries/get-players/get-players.request";
import { Player } from "@/features/home/entities/player/player.entity";

describe("GetPlayersHandler", () => {
  let handler: GetPlayersHandler;

  beforeEach(() => {
    handler = new GetPlayersHandler();
  });

  afterEach(() => jest.restoreAllMocks());

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
  });

  it("respects a custom limit", async () => {
    const findSpy = jest.spyOn(Player, "find").mockResolvedValue([]);

    const payload: GetPlayersRequest = { limit: 3 };
    await handler.execute(new GetPlayersQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({
      order: { classicalRating: "DESC" },
      take: 3,
    });
  });
});
