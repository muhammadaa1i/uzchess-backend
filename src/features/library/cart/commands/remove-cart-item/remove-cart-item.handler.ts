import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RemoveCartItemCommand } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.command";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { RemoveCartItemResponse } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.response";

@CommandHandler(RemoveCartItemCommand)
export class RemoveCartItemHandler implements ICommandHandler<RemoveCartItemCommand> {
  async execute(cmd: RemoveCartItemCommand) {
    const cartItem = await CartItem.findOneBy({
      bookId: cmd.bookId,
      userId: cmd.userId,
    });
    DoesNotExistException.ThrowIfNull(cartItem, "Cart item not found");

    await CartItem.remove(cartItem);

    return plainToInstance(RemoveCartItemResponse, {
      message: "Book removed from cart",
    });
  }
}
