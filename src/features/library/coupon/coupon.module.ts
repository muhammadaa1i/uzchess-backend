import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {CouponController} from "@/features/library/coupon/coupon.controller";
import {CreateCouponHandler} from "@/features/library/coupon/commands/create-coupon/create-coupon.handler";
import {UpdateCouponHandler} from "@/features/library/coupon/commands/update-coupon/update-coupon.handler";
import {DeleteCouponHandler} from "@/features/library/coupon/commands/delete-coupon/delete-coupon.handler";
import {GetCouponsHandler} from "@/features/library/coupon/queries/get-coupons/get-coupons.handler";
import {GetCouponByIdHandler} from "@/features/library/coupon/queries/get-coupon-by-id/get-coupon-by-id.handler";

@Module({
    imports: [CqrsModule],
    controllers: [CouponController],
    providers: [
        GetCouponsHandler,
        GetCouponByIdHandler,
        CreateCouponHandler,
        UpdateCouponHandler,
        DeleteCouponHandler,
    ],
})
export class CouponModule {
}
