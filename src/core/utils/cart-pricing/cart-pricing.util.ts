import {ILike} from "typeorm";
import {Coupon} from "@/features/library/entities/coupon/coupon.entity";
import {CouponType} from "@/core/enums/coupon-type/coupon-type.enum";

export async function resolveCoupon(
    code: string | undefined | null,
    baseAmount: number,
): Promise<{ couponCode: string | null; couponDiscount: number }> {
    if (!code) return {couponCode: null, couponDiscount: 0};

    const coupon = await Coupon.findOne({
        where: {code: ILike(code), isActive: true},
    });

    if (!coupon) return {couponCode: null, couponDiscount: 0};
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
        return {couponCode: null, couponDiscount: 0};

    const couponDiscount =
        coupon.type === CouponType.Percent
            ? Math.round((coupon.value / 100) * baseAmount)
            : Math.min(coupon.value, baseAmount);

    return {couponCode: coupon.code, couponDiscount};
}
