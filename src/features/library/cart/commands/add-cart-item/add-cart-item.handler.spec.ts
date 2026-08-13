import { AddCartItemHandler } from "@/features/library/cart/commands/add-cart-item/add-cart-item.handler";
import { AddCartItemCommand } from "@/features/library/cart/commands/add-cart-item/add-cart-item.command";
import { Book } from "@/features/library/entities/book/book.entity";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("AddCartItemHandler", () => {
  let handler: AddCartItemHandler;

  beforeEach(() => {
    handler = new AddCartItemHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("creates a cart item with quantity 1 on the happy path", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    jest.spyOn(CartItem, "existsBy").mockResolvedValue(false);
    const createSpy = jest
      .spyOn(CartItem, "create")
      .mockReturnValue({ bookId: 1, userId: 2, quantity: 1 } as any);
    const saveSpy = jest.spyOn(CartItem, "save").mockResolvedValue({} as any);

    const result = await handler.execute(new AddCartItemCommand(1, 2));

    expect(createSpy).toHaveBeenCalledWith({ bookId: 1, userId: 2, quantity: 1 });
    expect(saveSpy).toHaveBeenCalled();
    expect(result).toEqual({ bookId: 1, message: "Book added to cart" });
  });

  it("throws AlreadyExistException (409) when the book is already in the cart", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(true);
    jest.spyOn(CartItem, "existsBy").mockResolvedValue(true);
    const createSpy = jest.spyOn(CartItem, "create");
    const saveSpy = jest.spyOn(CartItem, "save");

    await expect(handler.execute(new AddCartItemCommand(1, 2))).rejects.toBeInstanceOf(
      AlreadyExistException,
    );
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the book doesn't exist", async () => {
    jest.spyOn(Book, "existsBy").mockResolvedValue(false);
    const existsBySpy = jest.spyOn(CartItem, "existsBy");

    await expect(handler.execute(new AddCartItemCommand(1, 2))).rejects.toBeInstanceOf(
      DoesNotExistException,
    );
    expect(existsBySpy).not.toHaveBeenCalled();
  });
});
