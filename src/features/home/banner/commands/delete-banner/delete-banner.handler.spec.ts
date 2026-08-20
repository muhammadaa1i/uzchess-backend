jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { DeleteBannerHandler } from "@/features/home/banner/commands/delete-banner/delete-banner.handler";
import { DeleteBannerCommand } from "@/features/home/banner/commands/delete-banner/delete-banner.command";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("DeleteBannerHandler", () => {
  let handler: DeleteBannerHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new DeleteBannerHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes a banner and its image on the happy path", async () => {
    const banner = {
      id: 1,
      title: "Title",
      imageUrl: "https://r2.example.com/banners/image.png",
    };
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(banner as any);
    const removeSpy = jest
      .spyOn(Banner, "remove")
      .mockResolvedValue(banner as any);

    const result = await handler.execute(new DeleteBannerCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(banner);
    expect(deleteUploadedFile).toHaveBeenCalledWith(
      "https://r2.example.com/banners/image.png",
    );
    expect(result).toEqual({ message: "Banner deleted successfully" });
  });

  it("skips image deletion when the banner has no image", async () => {
    const banner = { id: 1, title: "Title", imageUrl: null };
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(banner as any);
    jest.spyOn(Banner, "remove").mockResolvedValue(banner as any);

    await handler.execute(new DeleteBannerCommand(1));

    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Banner, "remove");

    await expect(
      handler.execute(new DeleteBannerCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it("invalidates the banners list and by-id cache on success", async () => {
    const banner = { id: 1, title: "Title", imageUrl: null };
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(banner as any);
    jest.spyOn(Banner, "remove").mockResolvedValue(banner as any);

    await handler.execute(new DeleteBannerCommand(1));

    expect(cache.del).toHaveBeenCalledWith("banners:list");
    expect(cache.del).toHaveBeenCalledWith("banners:1");
  });
});
