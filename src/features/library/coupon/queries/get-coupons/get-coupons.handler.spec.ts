import { GetCouponsHandler } from "@/features/library/coupon/queries/get-coupons/get-coupons.handler";
import { GetCouponsQuery } from "@/features/library/coupon/queries/get-coupons/get-coupons.query";
import { GetCouponsRequest } from "@/features/library/coupon/queries/get-coupons/get-coupons.request";
import { Coupon } from "@/features/library/entities/coupon/coupon.entity";
import { CouponType } from "@/core/enums/coupon-type/coupon-type.enum";

describe("GetCouponsHandler", () => {
  let handler: GetCouponsHandler;

  beforeEach(() => {
    handler = new GetCouponsHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("lists all coupons when no search term is given", async () => {
    const findSpy = jest.spyOn(Coupon, "find").mockResolvedValue([
      { id: 1, code: "A", type: CouponType.Fixed, value: 5, isActive: true, expiresAt: null },
      { id: 2, code: "B", type: CouponType.Percent, value: 10, isActive: true, expiresAt: null },
    ] as any);

    const payload: GetCouponsRequest = {};
    const result = await handler.execute(new GetCouponsQuery(payload));

    expect(findSpy).toHaveBeenCalledWith({ where: {} });
    expect(result).toHaveLength(2);
  });

  it("filters coupons by a case-insensitive partial code search", async () => {
    const findSpy = jest.spyOn(Coupon, "find").mockResolvedValue([
      { id: 1, code: "SAVE10", type: CouponType.Fixed, value: 5, isActive: true, expiresAt: null },
    ] as any);

    const payload: GetCouponsRequest = { search: "save" };
    await handler.execute(new GetCouponsQuery(payload));

    expect(findSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ code: expect.anything() }),
      }),
    );
  });
});
