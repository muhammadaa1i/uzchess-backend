import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { OrderController } from "@/features/library/order/order.controller";
import { CreateOrderHandler } from "@/features/library/order/commands/create-order/create-order.handler";
import { UpdateOrderStatusHandler } from "@/features/library/order/commands/update-order-status/update-order-status.handler";
import { GetOrdersHandler } from "@/features/library/order/queries/get-orders/get-orders.handler";

@Module({
  imports: [CqrsModule],
  controllers: [OrderController],
  providers: [CreateOrderHandler, UpdateOrderStatusHandler, GetOrdersHandler],
})
export class OrderModule {}
