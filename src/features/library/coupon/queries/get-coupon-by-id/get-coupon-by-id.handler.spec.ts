import { GetCouponByIdHandler } from "@/features/library/coupon/queries/get-coupon-by-id/get-coupon-by-id.handler";
import { GetCouponByIdQuery } from "@/features/library/coupon/queries/get-coupon-by-id/get-coupon-by-id.query";
import { Coupon } from "@/features/library/entities/coupon/coupon.entity";
import { CouponType } from "@/core/enums/coupon-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetCouponByIdHandler", () => {
  let handler: GetCouponByIdHandler;

  beforeEach(() => {
    handler = new GetCouponByIdHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the coupon on the happy path", async () => {
    jest.spyOn(Coupon, "findOneBy").mockResolvedValue({
      id: 1,
      code: "SAVE10",
      type: CouponType.Fixed,
      value: 10,
      isActive: true,
      expiresAt: null,
    } as any);

    const result = await handler.execute(new GetCouponByIdQuery(1));

    expect(result.id).toBe(1);
    expect(result.code).toBe("SAVE10");
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Coupon, "findOneBy").mockResolvedValue(null);

    await expect(handler.execute(new GetCouponByIdQuery(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
  });
});
