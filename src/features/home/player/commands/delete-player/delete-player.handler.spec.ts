jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeletePlayerHandler } from "@/features/home/player/commands/delete-player/delete-player.handler";
import { DeletePlayerCommand } from "@/features/home/player/commands/delete-player/delete-player.command";
import { Player } from "@/features/home/entities/player/player.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeletePlayerHandler", () => {
  let handler: DeletePlayerHandler;

  beforeEach(() => {
    handler = new DeletePlayerHandler();
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes a player and its avatar on the happy path", async () => {
    const player = {
      id: 1,
      name: "Magnus",
      avatarUrl: "https://r2.example.com/players/avatar.png",
    };
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);
    const removeSpy = jest
      .spyOn(Player, "remove")
      .mockResolvedValue(player as any);

    const result = await handler.execute(new DeletePlayerCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(player);
    expect(deleteUploadedFile).toHaveBeenCalledWith(
      "https://r2.example.com/players/avatar.png",
    );
    expect(result).toEqual({ message: "Player deleted successfully" });
  });

  it("skips avatar deletion when the player has no avatar", async () => {
    const player = { id: 1, name: "Magnus", avatarUrl: null };
    jest.spyOn(Player, "findOneBy").mockResolvedValue(player as any);
    jest.spyOn(Player, "remove").mockResolvedValue(player as any);

    await handler.execute(new DeletePlayerCommand(1));

    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Player, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Player, "remove");

    await expect(
      handler.execute(new DeletePlayerCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
