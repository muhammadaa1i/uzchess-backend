import { GetBannersHandler } from "@/features/home/banner/queries/get-banners/get-banners.handler";
import { Banner } from "@/features/home/entities/banner/banner.entity";

describe("GetBannersHandler", () => {
  let handler: GetBannersHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new GetBannersHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the cached value when a cache hit exists, without querying the DB", async () => {
    cache.get.mockResolvedValue([{ id: 1, title: "Cached" }]);
    const findSpy = jest.spyOn(Banner, "find");

    const result = await handler.execute();

    expect(result).toEqual([{ id: 1, title: "Cached" }]);
    expect(findSpy).not.toHaveBeenCalled();
  });

  it("returns only active banners ordered by createdAt desc", async () => {
    cache.get.mockResolvedValue(undefined);
    const findSpy = jest.spyOn(Banner, "find").mockResolvedValue([
      {
        id: 1,
        title: "Title",
        subtitle: null,
        imageUrl: null,
        linkUrl: null,
        badgeText: "1000$",
        isActive: true,
      },
    ] as any);

    const result = await handler.execute();

    expect(findSpy).toHaveBeenCalledWith({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
    expect(result).toHaveLength(1);
    expect(cache.set).toHaveBeenCalledWith("banners:list", result);
  });
});
