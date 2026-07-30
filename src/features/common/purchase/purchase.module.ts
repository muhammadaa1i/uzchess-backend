import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PurchaseController } from "@/features/common/purchase/purchase.controller";
import { GetPurchasesHandler } from "@/features/common/purchase/queries/get-purchases/get-purchases.handler";

@Module({
  imports: [CqrsModule],
  controllers: [PurchaseController],
  providers: [GetPurchasesHandler],
})
export class PurchaseModule {}
