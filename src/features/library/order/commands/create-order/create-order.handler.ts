import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateOrderCommand } from "@/features/library/order/commands/create-order/create-order.command";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Order } from "@/features/library/entities/order/order.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { OrderStatus } from "@/core/enums/order-status.enum";
import { In } from "typeorm";
import { plainToInstance } from "class-transformer";
import { CreateOrderResponse } from "@/features/library/order/commands/create-order/create-order.response";

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  async execute(cmd: CreateOrderCommand) {
    const cartItems = await CartItem.findBy({ userId: cmd.userId });
    DoesNotExistException.ThrowIf(!cartItems.length, "Cart is empty");

    const bookIds = cartItems.map((item) => item.bookId);
    const books = await Book.find({ where: { id: In(bookIds) } });
    const bookById = new Map(books.map((book) => [book.id, book]));

    const itemsPayload = cartItems.map((item) => {
      const book = bookById.get(item.bookId);
      const price = book!.discountPrice ?? book!.price;
      return { bookId: item.bookId, price };
    });

    const totalPrice = itemsPayload.reduce((sum, item) => sum + item.price, 0);

    const order = Order.create({
      userId: cmd.userId,
      status: OrderStatus.Processing,
      totalPrice,
    });
    await Order.save(order);

    const orderItems = itemsPayload.map((item) =>
      OrderItem.create({
        orderId: order.id,
        bookId: item.bookId,
        price: item.price,
      }),
    );
    await OrderItem.save(orderItems);

    await CartItem.remove(cartItems);

    return plainToInstance(CreateOrderResponse, order, {
      excludeExtraneousValues: true,
    });
  }
}
