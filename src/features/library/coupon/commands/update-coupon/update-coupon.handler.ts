import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UpdateCouponCommand} from "@/features/library/coupon/commands/update-coupon/update-coupon.command";
import {Coupon} from "@/features/library/entities/coupon/coupon.entity";
import {ILike, Not} from "typeorm";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {UpdateCouponResponse} from "@/features/library/coupon/commands/update-coupon/update-coupon.response";

@CommandHandler(UpdateCouponCommand)
export class UpdateCouponHandler implements ICommandHandler<UpdateCouponCommand> {
    async execute(cmd: UpdateCouponCommand) {
        const coupon = await Coupon.findOneBy({id: cmd.id});
        DoesNotExistException.ThrowIfNull(coupon, "Coupon not found");

        if (cmd.payload.code) {
            const alreadyExist = await Coupon.existsBy({
                id: Not(cmd.id),
                code: ILike(cmd.payload.code),
            });
            AlreadyExistException.ThrowIf(
                alreadyExist,
                "Coupon with this code already exist",
            );
            coupon.code = cmd.payload.code;
        }

        if (cmd.payload.type) coupon.type = cmd.payload.type;
        if (cmd.payload.value !== undefined) coupon.value = cmd.payload.value;
        if (cmd.payload.isActive !== undefined)
            coupon.isActive = cmd.payload.isActive;
        if (cmd.payload.expiresAt !== undefined)
            coupon.expiresAt = cmd.payload.expiresAt
                ? new Date(cmd.payload.expiresAt)
                : null;

        const saved = await coupon.save();

        return plainToInstance(UpdateCouponResponse, saved, {
            excludeExtraneousValues: true,
        });
    }
}
