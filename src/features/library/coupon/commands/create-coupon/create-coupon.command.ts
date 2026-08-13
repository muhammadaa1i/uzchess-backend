import { CreateCouponRequest } from "@/features/library/coupon/commands/create-coupon/create-coupon.request";

export class CreateCouponCommand {
  constructor(public readonly payload: CreateCouponRequest) {}
}
