import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreateOrderCommand } from "@/features/library/order/commands/create-order/create-order.command";
import { CreateOrderResponse } from "@/features/library/order/commands/create-order/create-order.response";
import { GetOrdersQuery } from "@/features/library/order/queries/get-orders/get-orders.query";
import { GetOrdersResponse } from "@/features/library/order/queries/get-orders/get-orders.response";
import { UpdateOrderStatusCommand } from "@/features/library/order/commands/update-order-status/update-order-status.command";
import { UpdateOrderStatusRequest } from "@/features/library/order/commands/update-order-status/update-order-status.request";
import { UpdateOrderStatusResponse } from "@/features/library/order/commands/update-order-status/update-order-status.response";
import { Roles } from "@/core/decorators/roles.decorator";
import { Role } from "@/core/enums/role.enum";

@ApiTags("Order")
@Controller("orders")
export class OrderController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOkResponse({ type: [GetOrdersResponse] })
  async getAll(@Req() req: Request) {
    return await this.queryBus.execute(new GetOrdersQuery(req.user!.id));
  }

  @Post("checkout")
  @ApiOkResponse({ type: CreateOrderResponse })
  async create(@Req() req: Request) {
    return await this.cmdBus.execute(new CreateOrderCommand(req.user!.id));
  }

  @Roles(Role.Admin)
  @Patch(":id/status")
  @ApiOkResponse({ type: UpdateOrderStatusResponse })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateOrderStatusRequest,
  ) {
    return await this.cmdBus.execute(new UpdateOrderStatusCommand(id, payload));
  }
}
