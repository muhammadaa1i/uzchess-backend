import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateCouponCommand} from "@/features/library/coupon/commands/create-coupon/create-coupon.command";
import {Coupon} from "@/features/library/entities/coupon/coupon.entity";
import {ILike} from "typeorm";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {plainToInstance} from "class-transformer";
import {CreateCouponResponse} from "@/features/library/coupon/commands/create-coupon/create-coupon.response";

@CommandHandler(CreateCouponCommand)
export class CreateCouponHandler implements ICommandHandler<CreateCouponCommand> {
    async execute(cmd: CreateCouponCommand) {
        const alreadyExist = await Coupon.existsBy({
            code: ILike(cmd.payload.code),
        });
        AlreadyExistException.ThrowIf(
            alreadyExist,
            "Coupon with this code already exist",
        );

        const newCoupon = Coupon.create({
            code: cmd.payload.code,
            type: cmd.payload.type,
            value: cmd.payload.value,
            isActive: cmd.payload.isActive ?? true,
            expiresAt: cmd.payload.expiresAt ? new Date(cmd.payload.expiresAt) : null,
        });
        const saved = await Coupon.save(newCoupon);

        return plainToInstance(CreateCouponResponse, saved, {
            excludeExtraneousValues: true,
        });
    }
}
