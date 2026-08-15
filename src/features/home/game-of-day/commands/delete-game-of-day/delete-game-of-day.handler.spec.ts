jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteGameOfDayHandler } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.handler";
import { DeleteGameOfDayCommand } from "@/features/home/game-of-day/commands/delete-game-of-day/delete-game-of-day.command";
import { GameOfDay } from "@/features/home/entities/game-of-day/game-of-day.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeleteGameOfDayHandler", () => {
  let handler: DeleteGameOfDayHandler;

  beforeEach(() => {
    handler = new DeleteGameOfDayHandler();
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes a game-of-day row and its video/thumbnail files", async () => {
    const gameOfDay = {
      id: 1,
      videoUrl: "video.mp4",
      thumbnailUrl: "thumb.png",
    };
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(gameOfDay as any);
    const removeSpy = jest
      .spyOn(GameOfDay, "remove")
      .mockResolvedValue(gameOfDay as any);

    const result = await handler.execute(new DeleteGameOfDayCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(gameOfDay);
    expect(deleteUploadedFile).toHaveBeenCalledWith("video.mp4");
    expect(deleteUploadedFile).toHaveBeenCalledWith("thumb.png");
    expect(result).toEqual({ message: "Game of the day deleted successfully" });
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(GameOfDay, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(GameOfDay, "remove");

    await expect(
      handler.execute(new DeleteGameOfDayCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
