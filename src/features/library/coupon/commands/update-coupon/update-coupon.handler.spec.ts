import { UpdateCouponHandler } from "@/features/library/coupon/commands/update-coupon/update-coupon.handler";
import { UpdateCouponCommand } from "@/features/library/coupon/commands/update-coupon/update-coupon.command";
import { UpdateCouponRequest } from "@/features/library/coupon/commands/update-coupon/update-coupon.request";
import { Coupon } from "@/features/library/entities/coupon/coupon.entity";
import { CouponType } from "@/core/enums/coupon-type.enum";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("UpdateCouponHandler", () => {
  let handler: UpdateCouponHandler;

  beforeEach(() => {
    handler = new UpdateCouponHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates a coupon on the happy path", async () => {
    const coupon: any = {
      id: 1,
      code: "OLD",
      type: CouponType.Fixed,
      value: 10,
      isActive: true,
      expiresAt: null,
      save: jest.fn(),
    };
    coupon.save.mockImplementation(async () => ({ ...coupon }));
    jest.spyOn(Coupon, "findOneBy").mockResolvedValue(coupon);
    jest.spyOn(Coupon, "existsBy").mockResolvedValue(false);

    const payload: UpdateCouponRequest = { code: "NEW", value: 25 };
    const result = await handler.execute(new UpdateCouponCommand(1, payload));

    expect(coupon.code).toBe("NEW");
    expect(coupon.value).toBe(25);
    expect(coupon.save).toHaveBeenCalled();
    expect(result.code).toBe("NEW");
    expect(result.value).toBe(25);
  });

  it("throws DoesNotExistException (404) when the coupon doesn't exist", async () => {
    jest.spyOn(Coupon, "findOneBy").mockResolvedValue(null);

    const payload: UpdateCouponRequest = { value: 25 };
    await expect(
      handler.execute(new UpdateCouponCommand(999, payload)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws AlreadyExistException (409) when renaming to a code already used by another coupon", async () => {
    const coupon: any = {
      id: 1,
      code: "OLD",
      type: CouponType.Fixed,
      value: 10,
      isActive: true,
      expiresAt: null,
      save: jest.fn(),
    };
    jest.spyOn(Coupon, "findOneBy").mockResolvedValue(coupon);
    jest.spyOn(Coupon, "existsBy").mockResolvedValue(true);

    const payload: UpdateCouponRequest = { code: "TAKEN" };
    await expect(
      handler.execute(new UpdateCouponCommand(1, payload)),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(coupon.save).not.toHaveBeenCalled();
  });
});
