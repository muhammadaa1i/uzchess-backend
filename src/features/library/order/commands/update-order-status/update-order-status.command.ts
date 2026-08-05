import { UpdateOrderStatusRequest } from "@/features/library/order/commands/update-order-status/update-order-status.request";

export class UpdateOrderStatusCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateOrderStatusRequest,
  ) {}
}
