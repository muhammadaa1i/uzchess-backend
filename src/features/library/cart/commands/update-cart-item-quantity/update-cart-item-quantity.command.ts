import {
    UpdateCartItemQuantityRequest
} from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.request";

export class UpdateCartItemQuantityCommand {
    constructor(
        public readonly bookId: number,
        public readonly userId: number,
        public readonly payload: UpdateCartItemQuantityRequest,
    ) {
    }
}
