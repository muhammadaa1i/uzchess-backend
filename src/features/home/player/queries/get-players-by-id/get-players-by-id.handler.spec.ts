import { GetPlayersByIdHandler } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.handler";
import { GetPlayersByIdQuery } from "@/features/home/player/queries/get-players-by-id/get-players-by-id.query";
import { Player } from "@/features/home/entities/player/player.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetPlayersByIdHandler", () => {
  let handler: GetPlayersByIdHandler;

  beforeEach(() => {
    handler = new GetPlayersByIdHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the player on the happy path", async () => {
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
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Player, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetPlayersByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
