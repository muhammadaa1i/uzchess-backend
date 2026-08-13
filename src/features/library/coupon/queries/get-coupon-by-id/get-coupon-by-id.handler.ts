import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCouponByIdQuery} from "@/features/library/coupon/queries/get-coupon-by-id/get-coupon-by-id.query";
import {Coupon} from "@/features/library/entities/coupon/coupon.entity";
import {plainToInstance} from "class-transformer";
import {GetCouponByIdResponse} from "@/features/library/coupon/queries/get-coupon-by-id/get-coupon-by-id.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetCouponByIdQuery)
export class GetCouponByIdHandler implements IQueryHandler<GetCouponByIdQuery> {
    async execute(query: GetCouponByIdQuery) {
        const coupon = await Coupon.findOneBy({id: query.id});

        DoesNotExistException.ThrowIfNull(coupon, "Coupon not found");

        return plainToInstance(GetCouponByIdResponse, coupon, {
            excludeExtraneousValues: true,
        });
    }
}
