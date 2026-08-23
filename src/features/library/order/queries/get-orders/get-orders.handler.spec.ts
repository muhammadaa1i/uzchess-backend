import { GetOrdersHandler } from "@/features/library/order/queries/get-orders/get-orders.handler";
import { GetOrdersQuery } from "@/features/library/order/queries/get-orders/get-orders.query";
import { Order } from "@/features/library/entities/order/order.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { OrderStatus } from "@/core/enums/order-status/order-status.enum";

describe("GetOrdersHandler", () => {
  let handler: GetOrdersHandler;

  beforeEach(() => {
    handler = new GetOrdersHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("only fetches orders scoped to the requesting user's id", async () => {
    const orderFindBySpy = jest.spyOn(Order, "findBy").mockResolvedValue([]);
    jest.spyOn(OrderItem, "findBy").mockResolvedValue([]);
    const bookFindSpy = jest.spyOn(Book, "find");

    await handler.execute(new GetOrdersQuery(9));

    expect(orderFindBySpy).toHaveBeenCalledWith({ userId: 9 });
    // no orders => no need to query items' books
    expect(bookFindSpy).not.toHaveBeenCalled();
  });

  it("skips OrderItem/Book lookups entirely when the user has no orders", async () => {
    jest.spyOn(Order, "findBy").mockResolvedValue([]);
    const orderItemFindSpy = jest.spyOn(OrderItem, "findBy").mockResolvedValue([]);
    const bookFindSpy = jest.spyOn(Book, "find").mockResolvedValue([]);

    const result = await handler.execute(new GetOrdersQuery(9));

    expect(orderItemFindSpy).not.toHaveBeenCalled();
    expect(bookFindSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("maps items and totals per order correctly, including books shared across orders", async () => {
    const orders = [
      {
        id: 1,
        userId: 9,
        status: OrderStatus.Processing,
        totalPrice: 230,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        userId: 9,
        status: OrderStatus.Delivered,
        totalPrice: 80,
        createdAt: "2026-01-02T00:00:00.000Z",
      },
    ];
    jest.spyOn(Order, "findBy").mockResolvedValue(orders as any);

    const orderItems = [
      { orderId: 1, bookId: 1, price: 80, quantity: 2 },
      { orderId: 1, bookId: 2, price: 50, quantity: 1 },
      { orderId: 2, bookId: 1, price: 80, quantity: 1 },
    ];
    const orderItemFindSpy = jest
      .spyOn(OrderItem, "findBy")
      .mockResolvedValue(orderItems as any);

    const books = [
      { id: 1, title: "Book One", cover: "cover1.png" },
      { id: 2, title: "Book Two", cover: "cover2.png" },
    ];
    const bookFindSpy = jest.spyOn(Book, "find").mockResolvedValue(books as any);

    const result = await handler.execute(new GetOrdersQuery(9));

    expect(orderItemFindSpy).toHaveBeenCalled();
    expect(bookFindSpy).toHaveBeenCalled();

    expect(result).toHaveLength(2);

    const [firstOrder, secondOrder] = result as any[];

    expect(firstOrder.id).toBe(1);
    expect(firstOrder.totalPrice).toBe(230);
    expect(firstOrder.items).toEqual([
      { bookId: 1, title: "Book One", cover: "cover1.png", price: 80 },
      { bookId: 2, title: "Book Two", cover: "cover2.png", price: 50 },
    ]);

    expect(secondOrder.id).toBe(2);
    expect(secondOrder.totalPrice).toBe(80);
    expect(secondOrder.items).toEqual([
      { bookId: 1, title: "Book One", cover: "cover1.png", price: 80 },
    ]);
  });
});
