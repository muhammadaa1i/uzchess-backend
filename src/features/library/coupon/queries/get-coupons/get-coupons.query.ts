import {GetCouponsRequest} from "@/features/library/coupon/queries/get-coupons/get-coupons.request";

export class GetCouponsQuery {
    constructor(public readonly payload: GetCouponsRequest) {
    }
}
