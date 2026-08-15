import { GetGameOfDaysByIdHandler } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.handler";
import { GetGameOfDaysByIdQuery } from "@/features/home/game-of-day/queries/get-game-of-days-by-id/get-game-of-days-by-id.query";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { GameType } from "@/core/enums/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetGameOfDaysByIdHandler", () => {
  let handler: GetGameOfDaysByIdHandler;

  beforeEach(() => {
    handler = new GetGameOfDaysByIdHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the row with flattened player summaries on the happy path", async () => {
    jest.spyOn(GameOfDay, "findOne").mockResolvedValue({
      id: 1,
      videoUrl: "video.mp4",
      thumbnailUrl: "thumb.png",
      durationSeconds: 300,
      gameType: GameType.Rapid,
      whitePlayerId: 1,
      blackPlayerId: 2,
      whitePlayer: { name: "Magnus Carlsen", avatarUrl: null, classicalRating: 2830 },
      blackPlayer: { name: "Hikaru Nakamura", avatarUrl: null, classicalRating: 2780 },
      isActive: true,
    } as any);

    const result = await handler.execute(new GetGameOfDaysByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.whitePlayerName).toBe("Magnus Carlsen");
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(GameOfDay, "findOne").mockResolvedValue(null);

    await expect(
      handler.execute(new GetGameOfDaysByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
