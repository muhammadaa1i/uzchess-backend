import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { OrderStatus } from "@/core/enums/order-status.enum";
import { OrderItemDto } from "@/features/library/order/queries/get-orders/order-item.dto";

export class GetOrdersResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty({ enum: OrderStatus })
  @Expose()
  status: OrderStatus;

  @ApiProperty()
  @Expose()
  totalPrice: number;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty({ type: [OrderItemDto] })
  @Expose()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
