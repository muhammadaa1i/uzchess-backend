import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GetPurchasesQuery } from "@/features/common/purchase/queries/get-purchases/get-purchases.query";
import { GetCoursePurchasesResponse } from "@/features/common/purchase/queries/get-purchases/get-purchases.response";
import { CreatePurchaseRequest } from "@/features/common/purchase/commands/create-purchase/create-purchase.request";
import { CreatePurchaseCommand } from "@/features/common/purchase/commands/create-purchase/create-purchase.command";
import { CreatePurchaseResponse } from "@/features/common/purchase/commands/create-purchase/create-purchase.response";

@ApiTags("Course Purchase")
@Controller("courses")
export class PurchaseController {
  constructor(
    private readonly cmdBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get("purchased")
  @ApiOkResponse({ type: [GetCoursePurchasesResponse] })
  async getAll(@Req() req: Request) {
    return await this.queryBus.execute(new GetPurchasesQuery(req.user!.id));
  }

  @Post(":id/purchase")
  @ApiOkResponse({ type: CreatePurchaseResponse })
  async create(
    @Param("id", ParseIntPipe) id: number,
    @Body() payload: CreatePurchaseRequest,
    @Req() req: Request,
  ) {
    return await this.cmdBus.execute(
      new CreatePurchaseCommand(req.user!.id, id, payload),
    );
  }
}
