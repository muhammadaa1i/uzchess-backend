import { BadRequestException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateOrderStatusCommand } from "@/features/library/order/commands/update-order-status/update-order-status.command";
import { Order } from "@/features/library/entities/order/order.entity";
import { OrderStatus } from "@/core/enums/order-status.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateOrderStatusResponse } from "@/features/library/order/commands/update-order-status/update-order-status.response";

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Processing]: [OrderStatus.Delivered, OrderStatus.Cancelled],
  [OrderStatus.Delivered]: [],
  [OrderStatus.Cancelled]: [],
};

@CommandHandler(UpdateOrderStatusCommand)
export class UpdateOrderStatusHandler
  implements ICommandHandler<UpdateOrderStatusCommand>
{
  async execute(cmd: UpdateOrderStatusCommand) {
    const order = await Order.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(order, "Order not found");

    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[order.status];
    if (!allowedNextStatuses.includes(cmd.payload.status)) {
      throw new BadRequestException(
        `Cannot change order status from "${order.status}" to "${cmd.payload.status}"`,
      );
    }

    order.status = cmd.payload.status;
    const saved = await order.save();

    return plainToInstance(UpdateOrderStatusResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
