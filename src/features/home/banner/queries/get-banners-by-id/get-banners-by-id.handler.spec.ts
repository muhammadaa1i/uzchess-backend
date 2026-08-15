import { GetBannersByIdHandler } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.handler";
import { GetBannersByIdQuery } from "@/features/home/banner/queries/get-banners-by-id/get-banners-by-id.query";
import { Banner } from "@/features/home/entities/banner/banner.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetBannersByIdHandler", () => {
  let handler: GetBannersByIdHandler;

  beforeEach(() => {
    handler = new GetBannersByIdHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the banner on the happy path", async () => {
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
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Banner, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetBannersByIdQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
