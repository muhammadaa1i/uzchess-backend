import {UpdateCouponRequest} from "@/features/library/coupon/commands/update-coupon/update-coupon.request";

export class UpdateCouponCommand {
    constructor(
        public readonly id: number,
        public readonly payload: UpdateCouponRequest,
    ) {
    }
}
