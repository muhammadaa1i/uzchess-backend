import { GetBannersByIdHandler } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.handler";
import { GetBannersByIdQuery } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.query";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetBannersByIdHandler", () => {
  let handler: GetBannersByIdHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetBannersByIdHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue({ id: 1, title: "Cached" });
    const findSpy = jest.spyOn(Banner, "findOneBy");

    const result = await handler.execute(new GetBannersByIdQuery(1));

    expect(result).toEqual({ id: 1, title: "Cached" });
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns the banner on the happy path", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Banner, "findOneBy").mockResolvedValue({
      id: 1,
      title: "Title",
      subtitle: null,
      imageUrl: null,
      linkUrl: null,
      badgeText: "1000$",
      isActive: true,
    } as any);

    const result = await handler.execute(new GetBannersByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.title).toBe("Title");
    expect(cache.set).toHaveBeenCalledWith("banners:1", result);
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    cache.get.mockResolvedValue(undefined);
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetBannersByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
