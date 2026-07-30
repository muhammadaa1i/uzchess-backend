import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { QueryBus } from "@nestjs/cqrs";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { GetPurchasesQuery } from "@/features/common/purchase/queries/get-purchases/get-purchases.query";
import { GetCoursePurchasesResponse } from "@/features/common/purchase/queries/get-purchases/get-purchases.response";

@ApiTags("Course Purchase")
@Controller("courses")
export class PurchaseController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("purchased")
  @ApiOkResponse({ type: [GetCoursePurchasesResponse] })
  async getAll(@Req() req: Request) {
    return await this.queryBus.execute(new GetPurchasesQuery(req.user!.id));
  }
}
