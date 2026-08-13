import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AddCartItemCommand } from "@/features/library/cart/commands/add-cart-item/add-cart-item.command";
import { AddCartItemResponse } from "@/features/library/cart/commands/add-cart-item/add-cart-item.response";
import { RemoveCartItemCommand } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.command";
import { RemoveCartItemResponse } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.response";
import { UpdateCartItemQuantityCommand } from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.command";
import { UpdateCartItemQuantityRequest } from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.request";
import { UpdateCartItemQuantityResponse } from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.response";
import { GetCartItemsQuery } from "@/features/library/cart/queries/get-cart-items/get-cart-items.query";
import { GetCartItemsResponse } from "@/features/library/cart/queries/get-cart-items/get-cart-items.response";
import { GetCartSummaryQuery } from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.query";
import { GetCartSummaryRequest } from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.request";
import { GetCartSummaryResponse } from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.response";

@ApiTags("Book Cart")
@Controller("cart")
export class CartController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get("read")
  @ApiOkResponse({ type: [GetCartItemsResponse] })
  async getAll(@Req() req: Request) {
    return await this.queryBus.execute(new GetCartItemsQuery(req.user!.id));
  }

  @Get("summary")
  @ApiOkResponse({ type: GetCartSummaryResponse })
  async getSummary(
    @Query() payload: GetCartSummaryRequest,
    @Req() req: Request,
  ) {
    return await this.queryBus.execute(
      new GetCartSummaryQuery(req.user!.id, payload),
    );
  }

  @Post("add/:id")
  @ApiOkResponse({ type: AddCartItemResponse })
  async create(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(new AddCartItemCommand(id, req.user!.id));
  }

  @Patch("update/:id")
  @ApiOkResponse({ type: UpdateCartItemQuantityResponse })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: UpdateCartItemQuantityRequest,
    @Req() req: Request,
  ) {
    return await this.cmdBus.execute(
      new UpdateCartItemQuantityCommand(id, req.user!.id, payload),
    );
  }

  @Delete("remove/:id")
  @ApiOkResponse({ type: RemoveCartItemResponse })
  async delete(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(
      new RemoveCartItemCommand(id, req.user!.id),
    );
  }
}
