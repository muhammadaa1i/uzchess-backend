import { GetGameOfDaysHandler } from "@/features/home/game-of-day/queries/get-game-of-days/get-game-of-days.handler";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { GameType } from "@/core/enums/game-type.enum";

describe("GetGameOfDaysHandler", () => {
  let handler: GetGameOfDaysHandler;

  beforeEach(() => {
    handler = new GetGameOfDaysHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns all game-of-day rows with flattened player summaries", async () => {
    const findSpy = jest.spyOn(GameOfDay, "find").mockResolvedValue([
      {
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
      },
    ] as any);

    const result = await handler.execute();

    expect(findSpy).toHaveBeenCalledWith({
      relations: { whitePlayer: true, blackPlayer: true },
      order: { createdAt: "DESC" },
    });
    expect(result).toHaveLength(1);
    expect(result[0].whitePlayerName).toBe("Magnus Carlsen");
  });
});
