import { CreateCouponHandler } from "@/features/library/coupon/commands/create-coupon/create-coupon.handler";
import { CreateCouponCommand } from "@/features/library/coupon/commands/create-coupon/create-coupon.command";
import { CreateCouponRequest } from "@/features/library/coupon/commands/create-coupon/create-coupon.request";
import { Coupon } from "@/features/library/entities/coupon/coupon.entity";
import { CouponType } from "@/core/enums/coupon-type/coupon-type.enum";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";

describe("CreateCouponHandler", () => {
  let handler: CreateCouponHandler;

  beforeEach(() => {
    handler = new CreateCouponHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a coupon on the happy path", async () => {
    jest.spyOn(Coupon, "existsBy").mockResolvedValue(false);
    const createSpy = jest.spyOn(Coupon, "create").mockReturnValue({
      id: 1,
      code: "SAVE10",
      type: CouponType.Fixed,
      value: 10,
      isActive: true,
      expiresAt: null,
    } as any);
    const saveSpy = jest.spyOn(Coupon, "save").mockImplementation(async (c: any) => c);

    const payload: CreateCouponRequest = {
      code: "SAVE10",
      type: CouponType.Fixed,
      value: 10,
    };
    const result = await handler.execute(new CreateCouponCommand(payload));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ code: "SAVE10", type: CouponType.Fixed, value: 10, isActive: true }),
    );
    expect(saveSpy).toHaveBeenCalled();
    expect(result.code).toBe("SAVE10");
  });

  it("throws AlreadyExistException (409) on a duplicate code", async () => {
    jest.spyOn(Coupon, "existsBy").mockResolvedValue(true);
    const saveSpy = jest.spyOn(Coupon, "save");

    const payload: CreateCouponRequest = {
      code: "SAVE10",
      type: CouponType.Fixed,
      value: 10,
    };

    await expect(handler.execute(new CreateCouponCommand(payload))).rejects.toBeInstanceOf(
      AlreadyExistException,
    );
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
