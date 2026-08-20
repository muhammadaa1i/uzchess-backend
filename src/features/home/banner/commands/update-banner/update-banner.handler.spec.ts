jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateBannerHandler } from "@/features/home/banner/commands/update-banner/update-banner.handler";
import { UpdateBannerCommand } from "@/features/home/banner/commands/update-banner/update-banner.command";
import { UpdateBannerRequest } from "@/features/home/banner/commands/update-banner/update-banner.request";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("UpdateBannerHandler", () => {
  let handler: UpdateBannerHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new UpdateBannerHandler(cache as any);
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates a banner on the happy path", async () => {
    const saveMock = jest.fn();
    const banner = {
      id: 1,
      title: "Old Title",
      subtitle: null,
      imageUrl: null,
      linkUrl: null,
      badgeText: null,
      isActive: true,
      save: saveMock,
    };
    saveMock.mockImplementation(() => Promise.resolve(banner));
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(banner as any);

    const payload: UpdateBannerRequest = {
      title: "New Title",
      isActive: false,
    };
    const result = await handler.execute(
      new UpdateBannerCommand(1, payload, undefined),
    );

    expect(banner.title).toBe("New Title");
    expect(banner.isActive).toBe(false);
    expect(saveMock).toHaveBeenCalled();
    expect(result.title).toBe("New Title");
  });

  it("deletes the old image when a new one is uploaded", async () => {
    const banner = {
      id: 1,
      title: "Title",
      subtitle: null,
      imageUrl: "https://r2.example.com/banners/old.png",
      linkUrl: null,
      badgeText: null,
      isActive: true,
      save: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(banner as any);

    const payload: UpdateBannerRequest = {};
    await handler.execute(
      new UpdateBannerCommand(
        1,
        payload,
        "https://r2.example.com/banners/new.png",
      ),
    );

    expect(deleteUploadedFile).toHaveBeenCalledWith(
      "https://r2.example.com/banners/old.png",
    );
    expect(banner.imageUrl).toBe("https://r2.example.com/banners/new.png");
  });

  it("throws DoesNotExistException (404) when the banner doesn't exist", async () => {
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(null);

    const payload: UpdateBannerRequest = { title: "New Title" };
    await expect(
      handler.execute(new UpdateBannerCommand(999, payload, undefined)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("invalidates the banners list and by-id cache on success", async () => {
    const banner = {
      id: 1,
      title: "Old Title",
      subtitle: null,
      imageUrl: null,
      linkUrl: null,
      badgeText: null,
      isActive: true,
      save: jest.fn(),
    };
    banner.save.mockImplementation(() => Promise.resolve(banner));
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(banner as any);

    const payload: UpdateBannerRequest = { title: "New Title" };
    await handler.execute(new UpdateBannerCommand(1, payload, undefined));

    expect(cache.del).toHaveBeenCalledWith("banners:list");
    expect(cache.del).toHaveBeenCalledWith("banners:1");
  });
});
