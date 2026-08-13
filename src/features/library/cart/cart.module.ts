import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CartController } from "@/features/library/cart/cart.controller";
import { AddCartItemHandler } from "@/features/library/cart/commands/add-cart-item/add-cart-item.handler";
import { RemoveCartItemHandler } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.handler";
import { UpdateCartItemQuantityHandler } from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.handler";
import { GetCartItemsHandler } from "@/features/library/cart/queries/get-cart-items/get-cart-items.handler";
import { GetCartSummaryHandler } from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.handler";

@Module({
  imports: [CqrsModule],
  controllers: [CartController],
  providers: [
    AddCartItemHandler,
    RemoveCartItemHandler,
    UpdateCartItemQuantityHandler,
    GetCartItemsHandler,
    GetCartSummaryHandler,
  ],
})
export class CartModule {}
