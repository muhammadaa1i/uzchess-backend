import { UpdateCartItemQuantityHandler } from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.handler";
import { UpdateCartItemQuantityCommand } from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.command";
import { UpdateCartItemQuantityRequest } from "@/features/library/cart/commands/update-cart-item-quantity/update-cart-item-quantity.request";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("UpdateCartItemQuantityHandler", () => {
  let handler: UpdateCartItemQuantityHandler;

  beforeEach(() => {
    handler = new UpdateCartItemQuantityHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("updates the quantity on the happy path", async () => {
    const cartItem: any = {
      bookId: 1,
      userId: 2,
      quantity: 1,
      save: jest.fn(),
    };
    cartItem.save.mockImplementation(async () => ({ ...cartItem }));
    jest.spyOn(CartItem, "findOneBy").mockResolvedValue(cartItem);

    const payload: UpdateCartItemQuantityRequest = { quantity: 5 };
    const result = await handler.execute(
      new UpdateCartItemQuantityCommand(1, 2, payload),
    );

    expect(cartItem.quantity).toBe(5);
    expect(cartItem.save).toHaveBeenCalled();
    expect(result).toEqual({ bookId: 1, quantity: 5 });
  });

  it("throws DoesNotExistException (404) when the item isn't in the cart", async () => {
    jest.spyOn(CartItem, "findOneBy").mockResolvedValue(null);

    const payload: UpdateCartItemQuantityRequest = { quantity: 5 };
    await expect(
      handler.execute(new UpdateCartItemQuantityCommand(1, 2, payload)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });
});
