import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { PurchaseController } from "@/features/common/purchase/purchase.controller";
import { GetPurchasesHandler } from "@/features/common/purchase/queries/get-purchases/get-purchases.handler";
import { CreatePurchaseHandler } from "@/features/common/purchase/commands/create-purchase/create-purchase.handler";

@Module({
  imports: [CqrsModule],
  controllers: [PurchaseController],
  providers: [GetPurchasesHandler, CreatePurchaseHandler],
})
export class PurchaseModule {}
