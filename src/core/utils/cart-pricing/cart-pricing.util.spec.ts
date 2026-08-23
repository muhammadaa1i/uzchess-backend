import {resolveCoupon} from "@/core/utils/cart-pricing/cart-pricing.util";
import {Coupon} from "@/features/library/entities/coupon/coupon.entity";
import {CouponType} from "@/core/enums/coupon-type/coupon-type.enum";

describe("resolveCoupon", () => {
    afterEach(() => jest.restoreAllMocks());

    it("returns no coupon when no code is given", async () => {
        const findOneSpy = jest.spyOn(Coupon, "findOne");

        const result = await resolveCoupon(undefined, 100);

        expect(result).toEqual({couponCode: null, couponDiscount: 0});
        expect(findOneSpy).not.toHaveBeenCalled();
    });

    it("returns no coupon when the code is an empty string", async () => {
        const findOneSpy = jest.spyOn(Coupon, "findOne");

        const result = await resolveCoupon("", 100);

        expect(result).toEqual({couponCode: null, couponDiscount: 0});
        expect(findOneSpy).not.toHaveBeenCalled();
    });

    it("returns no coupon for an unknown code", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue(null);

        const result = await resolveCoupon("UNKNOWN", 100);

        expect(result).toEqual({couponCode: null, couponDiscount: 0});
    });

    it("matches codes case-insensitively and returns the canonical stored code", async () => {
        const findOneSpy = jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "SAVE10",
            type: CouponType.Fixed,
            value: 10,
            isActive: true,
            expiresAt: null,
        } as any);

        const result = await resolveCoupon("save10", 100);

        expect(result.couponCode).toBe("SAVE10");
        expect(findOneSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({isActive: true}),
            }),
        );
    });

    it("computes a percent discount", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "PCT20",
            type: CouponType.Percent,
            value: 20,
            isActive: true,
            expiresAt: null,
        } as any);

        const result = await resolveCoupon("PCT20", 250);

        // 20% of 250 = 50
        expect(result).toEqual({couponCode: "PCT20", couponDiscount: 50});
    });

    it("rounds a percent discount to the nearest whole unit", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "PCT15",
            type: CouponType.Percent,
            value: 15,
            isActive: true,
            expiresAt: null,
        } as any);

        const result = await resolveCoupon("PCT15", 33);

        // 15% of 33 = 4.95 -> rounds to 5
        expect(result).toEqual({couponCode: "PCT15", couponDiscount: 5});
    });

    it("computes a fixed discount", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "FIX15",
            type: CouponType.Fixed,
            value: 15,
            isActive: true,
            expiresAt: null,
        } as any);

        const result = await resolveCoupon("FIX15", 100);

        expect(result).toEqual({couponCode: "FIX15", couponDiscount: 15});
    });

    it("clamps a fixed discount larger than the base amount", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "BIG",
            type: CouponType.Fixed,
            value: 500,
            isActive: true,
            expiresAt: null,
        } as any);

        const result = await resolveCoupon("BIG", 100);

        expect(result).toEqual({couponCode: "BIG", couponDiscount: 100});
    });

    it("clamps a percent discount so it never exceeds the base amount", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "PCT100",
            type: CouponType.Percent,
            value: 100,
            isActive: true,
            expiresAt: null,
        } as any);

        const result = await resolveCoupon("PCT100", 40);

        expect(result).toEqual({couponCode: "PCT100", couponDiscount: 40});
    });

    it("rejects an expired coupon", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "OLD",
            type: CouponType.Fixed,
            value: 10,
            isActive: true,
            expiresAt: new Date("2000-01-01"),
        } as any);

        const result = await resolveCoupon("OLD", 100);

        expect(result).toEqual({couponCode: null, couponDiscount: 0});
    });

    it("accepts a coupon with a future expiry date", async () => {
        jest.spyOn(Coupon, "findOne").mockResolvedValue({
            code: "FUTURE",
            type: CouponType.Fixed,
            value: 10,
            isActive: true,
            expiresAt: new Date("2999-01-01"),
        } as any);

        const result = await resolveCoupon("FUTURE", 100);

        expect(result).toEqual({couponCode: "FUTURE", couponDiscount: 10});
    });

    it("treats an inactive coupon (filtered out at the query level) as not found", async () => {
        // isActive: true is baked into the where clause resolveCoupon builds, so an
        // inactive coupon simply never comes back from findOne.
        const findOneSpy = jest.spyOn(Coupon, "findOne").mockResolvedValue(null);

        const result = await resolveCoupon("INACTIVE", 100);

        expect(result).toEqual({couponCode: null, couponDiscount: 0});
        expect(findOneSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({isActive: true}),
            }),
        );
    });
});
