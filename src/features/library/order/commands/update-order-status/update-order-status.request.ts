import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { OrderStatus } from "@/core/enums/order-status/order-status.enum";

export class UpdateOrderStatusRequest {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
