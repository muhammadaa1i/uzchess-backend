import { DeleteCouponHandler } from "@/features/library/coupon/commands/delete-coupon/delete-coupon.handler";
import { DeleteCouponCommand } from "@/features/library/coupon/commands/delete-coupon/delete-coupon.command";
import { Coupon } from "@/features/library/entities/coupon/coupon.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("DeleteCouponHandler", () => {
  let handler: DeleteCouponHandler;

  beforeEach(() => {
    handler = new DeleteCouponHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("deletes a coupon on the happy path", async () => {
    const coupon = { id: 1, code: "SAVE10" };
    jest.spyOn(Coupon, "findOneBy").mockResolvedValue(coupon as any);
    const removeSpy = jest.spyOn(Coupon, "remove").mockResolvedValue(coupon as any);

    const result = await handler.execute(new DeleteCouponCommand(1));

    expect(removeSpy).toHaveBeenCalledWith(coupon);
    expect(result).toEqual({ message: "Coupon deleted successfully" });
  });

  it("throws DoesNotExistException (404) for an unknown id", async () => {
    jest.spyOn(Coupon, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(Coupon, "remove");

    await expect(handler.execute(new DeleteCouponCommand(999))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
