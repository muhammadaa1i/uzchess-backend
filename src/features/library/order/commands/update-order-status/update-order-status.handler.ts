import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateOrderStatusCommand } from "@/features/library/order/commands/update-order-status/update-order-status.command";
import { Order } from "@/features/library/entities/order/order.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateOrderStatusResponse } from "@/features/library/order/commands/update-order-status/update-order-status.response";

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  async execute(cmd: UpdateOrderStatusCommand) {
    const order = await Order.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(order, "Order not found");

    order.status = cmd.payload.status;
    const saved = await order.save();

    return plainToInstance(UpdateOrderStatusResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
