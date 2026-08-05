import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetOrdersQuery } from "@/features/library/order/queries/get-orders/get-orders.query";
import { Order } from "@/features/library/entities/order/order.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { In } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetOrdersResponse } from "@/features/library/order/queries/get-orders/get-orders.response";

@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
  async execute(query: GetOrdersQuery) {
    const orders = await Order.findBy({ userId: query.userId });
    const orderIds = orders.map((order) => order.id);

    const orderItems = orderIds.length
      ? await OrderItem.findBy({ orderId: In(orderIds) })
      : [];

    const bookIds = orderItems.map((item) => item.bookId);
    const books = bookIds.length
      ? await Book.find({ where: { id: In(bookIds) } })
      : [];
    const bookById = new Map(books.map((book) => [book.id, book]));

    const itemsByOrderId = new Map<number, typeof orderItems>();
    for (const item of orderItems) {
      const items = itemsByOrderId.get(item.orderId) ?? [];
      items.push(item);
      itemsByOrderId.set(item.orderId, items);
    }

    return plainToInstance(
      GetOrdersResponse,
      orders.map((order) => ({
        ...order,
        items: (itemsByOrderId.get(order.id) ?? []).map((item) => ({
          bookId: item.bookId,
          title: bookById.get(item.bookId)?.title,
          cover: bookById.get(item.bookId)?.cover,
          price: item.price,
        })),
      })),
      { excludeExtraneousValues: true },
    );
  }
}
