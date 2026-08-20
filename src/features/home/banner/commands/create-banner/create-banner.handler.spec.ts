import { CreateBannerHandler } from "@/features/home/banner/commands/create-banner/create-banner.handler";
import { CreateBannerCommand } from "@/features/home/banner/commands/create-banner/create-banner.command";
import { CreateBannerRequest } from "@/features/home/banner/commands/create-banner/create-banner.request";
import { Banner } from "@/features/home/entities/banner/banner.entity";

describe("CreateBannerHandler", () => {
  let handler: CreateBannerHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CreateBannerHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a banner on the happy path", async () => {
    const createSpy = jest.spyOn(Banner, "create").mockReturnValue({
      id: 1,
      title: "Win big",
      subtitle: "Join the tournament",
      imageUrl: "https://r2.example.com/banners/image.png",
      linkUrl: "https://example.com/tournament",
      badgeText: "1000$",
      isActive: true,
    } as any);
    const saveSpy = jest.spyOn(Banner, "save").mockImplementation((b) => b);

    const payload: CreateBannerRequest = {
      title: "Win big",
      subtitle: "Join the tournament",
      linkUrl: "https://example.com/tournament",
      badgeText: "1000$",
    };
    const result = await handler.execute(
      new CreateBannerCommand(
        payload,
        "https://r2.example.com/banners/image.png",
      ),
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Win big",
        subtitle: "Join the tournament",
        imageUrl: "https://r2.example.com/banners/image.png",
        linkUrl: "https://example.com/tournament",
        badgeText: "1000$",
        isActive: true,
      }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(result.title).toBe("Win big");
  });

  it("defaults optional fields to null and isActive to true when not provided", async () => {
    jest.spyOn(Banner, "create").mockReturnValue({
      id: 2,
      title: "Simple banner",
      subtitle: null,
      imageUrl: null,
      linkUrl: null,
      badgeText: null,
      isActive: true,
    } as any);
    jest.spyOn(Banner, "save").mockImplementation((b) => b);

    const payload: CreateBannerRequest = { title: "Simple banner" };
    const result = await handler.execute(
      new CreateBannerCommand(payload, undefined),
    );

    expect(result.subtitle).toBeNull();
    expect(result.imageUrl).toBeNull();
    expect(result.linkUrl).toBeNull();
    expect(result.badgeText).toBeNull();
    expect(result.isActive).toBe(true);
  });

  it("invalidates the banners list cache on success", async () => {
    jest.spyOn(Banner, "create").mockReturnValue({ id: 1 } as any);
    jest.spyOn(Banner, "save").mockImplementation((b: any) => Promise.resolve(b));

    const payload: CreateBannerRequest = { title: "Simple banner" };
    await handler.execute(new CreateBannerCommand(payload, undefined));

    expect(cache.del).toHaveBeenCalledWith("banners:list");
  });
});
