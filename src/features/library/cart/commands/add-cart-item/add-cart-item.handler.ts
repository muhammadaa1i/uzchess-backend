import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AddCartItemCommand } from "@/features/library/cart/commands/add-cart-item/add-cart-item.command";
import { Book } from "@/features/library/entities/book/book.entity";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { AddCartItemResponse } from "@/features/library/cart/commands/add-cart-item/add-cart-item.response";

@CommandHandler(AddCartItemCommand)
export class AddCartItemHandler implements ICommandHandler<AddCartItemCommand> {
  async execute(cmd: AddCartItemCommand) {
    const bookExists = await Book.existsBy({ id: cmd.bookId });
    DoesNotExistException.ThrowIf(!bookExists, "Book not found");

    const alreadyInCart = await CartItem.existsBy({
      bookId: cmd.bookId,
      userId: cmd.userId,
    });
    AlreadyExistException.ThrowIf(alreadyInCart, "Book already in cart");

    const cartItem = CartItem.create({
      bookId: cmd.bookId,
      userId: cmd.userId,
      quantity: 1,
    });
    await CartItem.save(cartItem);

    return plainToInstance(
      AddCartItemResponse,
      {
        bookId: cmd.bookId,
        message: "Book added to cart",
      },
      { excludeExtraneousValues: true },
    );
  }
}
