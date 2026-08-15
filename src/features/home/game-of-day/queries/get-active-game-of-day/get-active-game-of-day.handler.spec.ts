import { GetActiveGameOfDayHandler } from "@/features/home/game-of-day/queries/get-active-game-of-day/get-active-game-of-day.handler";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { GameType } from "@/core/enums/game-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetActiveGameOfDayHandler", () => {
  let handler: GetActiveGameOfDayHandler;

  beforeEach(() => {
    handler = new GetActiveGameOfDayHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the active row on the happy path", async () => {
    const findSpy = jest.spyOn(GameOfDay, "findOne").mockResolvedValue({
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

    const result = await handler.execute();

    expect(findSpy).toHaveBeenCalledWith({
      where: { isActive: true },
      relations: { whitePlayer: true, blackPlayer: true },
    });
    expect(result.whitePlayerName).toBe("Magnus Carlsen");
  });

  it("throws DoesNotExistException (404) when there is no active row", async () => {
    jest.spyOn(GameOfDay, "findOne").mockResolvedValue(null);

    await expect(handler.execute()).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
  });
});
