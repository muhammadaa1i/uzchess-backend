import { CreateOrderRequest } from "@/features/library/order/commands/create-order/create-order.request";

export class CreateOrderCommand {
  constructor(
    public readonly userId: number,
    public readonly payload: CreateOrderRequest,
  ) {}
}
