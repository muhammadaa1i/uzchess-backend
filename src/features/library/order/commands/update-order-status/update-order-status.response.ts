import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { OrderStatus } from "@/core/enums/order-status/order-status.enum";

export class UpdateOrderStatusResponse {
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
}
