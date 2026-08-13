import { RemoveCartItemHandler } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.handler";
import { RemoveCartItemCommand } from "@/features/library/cart/commands/remove-cart-item/remove-cart-item.command";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("RemoveCartItemHandler", () => {
  let handler: RemoveCartItemHandler;

  beforeEach(() => {
    handler = new RemoveCartItemHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("removes the cart item on the happy path", async () => {
    const cartItem = { bookId: 1, userId: 2 };
    jest.spyOn(CartItem, "findOneBy").mockResolvedValue(cartItem as any);
    const removeSpy = jest.spyOn(CartItem, "remove").mockResolvedValue(cartItem as any);

    const result = await handler.execute(new RemoveCartItemCommand(1, 2));

    expect(removeSpy).toHaveBeenCalledWith(cartItem);
    expect(result).toEqual({ message: "Book removed from cart" });
  });

  it("throws DoesNotExistException (404) when the item isn't in the cart", async () => {
    jest.spyOn(CartItem, "findOneBy").mockResolvedValue(null);
    const removeSpy = jest.spyOn(CartItem, "remove");

    await expect(handler.execute(new RemoveCartItemCommand(1, 2))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
