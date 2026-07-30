import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AddCartItemCommand } from "@/features/library/cart/commands/add-cart-item/add-cart-item.command";
import { AddCartItemResponse } from "@/features/library/cart/commands/add-cart-item/add-cart-item.response";
import { RemoveCartItemCommand } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.command";
import { RemoveCartItemResponse } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.response";
import { GetCartItemsQuery } from "@/features/library/cart/queries/get-cart-items/get-cart-items.query";
import { GetCartItemsResponse } from "@/features/library/cart/queries/get-cart-items/get-cart-items.response";

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

  @Post("add/:id")
  @ApiOkResponse({ type: AddCartItemResponse })
  async create(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(new AddCartItemCommand(id, req.user!.id));
  }

  @Delete("remove/:id")
  @ApiOkResponse({ type: RemoveCartItemResponse })
  async delete(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    return await this.cmdBus.execute(
      new RemoveCartItemCommand(id, req.user!.id),
    );
  }
}
