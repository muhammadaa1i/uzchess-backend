import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateOrderCommand } from "@/features/library/order/commands/create-order/create-order.command";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Order } from "@/features/library/entities/order/order.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { DeliverySetting } from "@/features/library/entities/delivery-setting/delivery-setting.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { OrderStatus } from "@/core/enums/order-status.enum";
import { In, QueryFailedError } from "typeorm";
import { plainToInstance } from "class-transformer";
import { CreateOrderResponse } from "@/features/library/order/commands/create-order/create-order.response";
import { resolveCoupon } from "@/features/library/cart/cart-pricing.util";
import { Cache } from "@nestjs/cache-manager";
import { TOP_RATED_BOOKS_CACHE_KEY } from "@/features/library/book/book.cache";

const MAX_ORDER_NUMBER_ATTEMPTS = 5;

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateOrderCommand) {
    const cartItems = await CartItem.findBy({ userId: cmd.userId });
    DoesNotExistException.ThrowIf(!cartItems.length, "Cart is empty");

    const bookIds = cartItems.map((item) => item.bookId);
    const books = await Book.find({ where: { id: In(bookIds) } });
    const bookById = new Map(books.map((book) => [book.id, book]));

    const itemsPayload = cartItems.map((item) => {
      const book = bookById.get(item.bookId);
      const price = book!.discountPrice ?? book!.price;
      return { bookId: item.bookId, price, quantity: item.quantity };
    });

    const subtotal = itemsPayload.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const { couponDiscount } = await resolveCoupon(cmd.payload.code, subtotal);

    const deliverySetting = await DeliverySetting.findOne({ where: {} });
    const deliveryFee = deliverySetting?.fee ?? 0;

    const totalPrice = Math.max(0, subtotal - couponDiscount + deliveryFee);

    let order: Order | undefined;
    for (let attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt++) {
      const candidate = Order.create({
        userId: cmd.userId,
        status: OrderStatus.Processing,
        totalPrice,
        orderNumber: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        fullName: cmd.payload.fullName,
        phone: cmd.payload.phone,
        email: cmd.payload.email,
      });
      try {
        await Order.save(candidate);
        order = candidate;
        break;
      } catch (err) {
        const isDuplicateOrderNumber =
          err instanceof QueryFailedError &&
          (err.driverError as { code?: string })?.code === "23505";
        if (!isDuplicateOrderNumber || attempt === MAX_ORDER_NUMBER_ATTEMPTS)
          throw err;
      }
    }

    const orderItems = itemsPayload.map((item) =>
      OrderItem.create({
        orderId: order!.id,
        bookId: item.bookId,
        price: item.price,
        quantity: item.quantity,
      }),
    );
    await OrderItem.save(orderItems);

    await CartItem.remove(cartItems);

    await this.cache.del(TOP_RATED_BOOKS_CACHE_KEY);

    return plainToInstance(CreateOrderResponse, order!, {
      excludeExtraneousValues: true,
    });
  }
}
