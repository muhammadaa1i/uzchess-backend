import { GetBannersHandler } from "@/features/home/banner/queries/get-banners/get-banners.handler";
import { GetBannersQuery } from "@/features/home/banner/queries/get-banners/get-banners.query";
import { Banner } from "@/features/home/entities/banner/banner.entity";

describe("GetBannersHandler", () => {
  let handler: GetBannersHandler;

  beforeEach(() => {
    handler = new GetBannersHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns only active banners ordered by createdAt desc", async () => {
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

    const result = await handler.execute(new GetBannersQuery());

    expect(findSpy).toHaveBeenCalledWith({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
    expect(result).toHaveLength(1);
  });
});
