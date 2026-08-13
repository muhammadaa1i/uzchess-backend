import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {
    UpdateCartItemQuantityCommand
} from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.command";
import {CartItem} from "@/features/library/entities/cart/cart-item.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {plainToInstance} from "class-transformer";
import {
    UpdateCartItemQuantityResponse
} from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.response";

@CommandHandler(UpdateCartItemQuantityCommand)
export class UpdateCartItemQuantityHandler implements ICommandHandler<UpdateCartItemQuantityCommand> {
    async execute(cmd: UpdateCartItemQuantityCommand) {
        const cartItem = await CartItem.findOneBy({
            bookId: cmd.bookId,
            userId: cmd.userId,
        });
        DoesNotExistException.ThrowIfNull(cartItem, "Cart item not found");

        cartItem.quantity = cmd.payload.quantity;
        const saved = await cartItem.save();

        return plainToInstance(
            UpdateCartItemQuantityResponse,
            {bookId: saved.bookId, quantity: saved.quantity},
            {excludeExtraneousValues: true},
        );
    }
}
