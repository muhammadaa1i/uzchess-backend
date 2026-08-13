import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {DeleteCouponCommand} from "@/features/library/coupon/commands/delete-coupon/delete-coupon.command";
import {Coupon} from "@/features/library/entities/coupon/coupon.entity";
import {plainToInstance} from "class-transformer";
import {DeleteCouponResponse} from "@/features/library/coupon/commands/delete-coupon/delete-coupon.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@CommandHandler(DeleteCouponCommand)
export class DeleteCouponHandler implements ICommandHandler<DeleteCouponCommand> {
    async execute(cmd: DeleteCouponCommand) {
        const coupon = await Coupon.findOneBy({id: cmd.id});

        DoesNotExistException.ThrowIfNull(coupon, "Coupon not found");

        await Coupon.remove(coupon);

        return plainToInstance(DeleteCouponResponse, {
            message: "Coupon deleted successfully",
        });
    }
}
