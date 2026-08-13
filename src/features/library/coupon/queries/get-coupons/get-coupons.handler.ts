import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCouponsQuery} from "@/features/library/coupon/queries/get-coupons/get-coupons.query";
import {Coupon} from "@/features/library/entities/coupon/coupon.entity";
import {FindOptionsWhere, ILike} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetCouponsResponse} from "@/features/library/coupon/queries/get-coupons/get-coupons.response";

@QueryHandler(GetCouponsQuery)
export class GetCouponsHandler implements IQueryHandler<GetCouponsQuery> {
    async execute(query: GetCouponsQuery) {
        const where: FindOptionsWhere<Coupon> = {};
        if (query.payload.search) where.code = ILike(`%${query.payload.search}%`);

        const coupons = await Coupon.find({where});

        return plainToInstance(GetCouponsResponse, coupons, {
            excludeExtraneousValues: true,
        });
    }
}
