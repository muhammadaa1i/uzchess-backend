import { CreateOrderHandler } from "@/features/library/order/commands/create-order/create-order.handler";
import { CreateOrderCommand } from "@/features/library/order/commands/create-order/create-order.command";
import { CreateOrderRequest } from "@/features/library/order/commands/create-order/create-order.request";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Order } from "@/features/library/entities/order/order.entity";
import { OrderItem } from "@/features/library/entities/order/order-item.entity";
import { DeliverySetting } from "@/features/library/entities/delivery-setting/delivery-setting.entity";
import { Coupon } from "@/features/library/entities/coupon/coupon.entity";
import { OrderStatus } from "@/core/enums/order-status.enum";
import { CouponType } from "@/core/enums/coupon-type.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("CreateOrderHandler", () => {
  let handler: CreateOrderHandler;

  beforeEach(() => {
    handler = new CreateOrderHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException when the cart is empty", async () => {
    jest.spyOn(CartItem, "findBy").mockResolvedValue([]);
    const bookFindSpy = jest.spyOn(Book, "find");
    const orderSaveSpy = jest.spyOn(Order, "save");

    const payload: CreateOrderRequest = {
      fullName: "John Doe",
      phone: "+998901234567",
      email: "john@example.com",
    };
    await expect(
      handler.execute(new CreateOrderCommand(9, payload)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(bookFindSpy).not.toHaveBeenCalled();
    expect(orderSaveSpy).not.toHaveBeenCalled();
  });

  it("computes subtotal/coupon/delivery-fee math the same way get-cart-summary does, and clears the cart", async () => {
    const cartItems = [
      { bookId: 1, userId: 9, quantity: 2 },
      { bookId: 2, userId: 9, quantity: 1 },
    ];
    jest.spyOn(CartItem, "findBy").mockResolvedValue(cartItems as any);
    jest.spyOn(Book, "find").mockResolvedValue([
      { id: 1, price: 100, discountPrice: 80 },
      { id: 2, price: 50, discountPrice: null },
    ] as any);
    jest.spyOn(Coupon, "findOne").mockResolvedValue({
      code: "FIX10",
      type: CouponType.Fixed,
      value: 10,
      isActive: true,
      expiresAt: null,
    } as any);
    jest
      .spyOn(DeliverySetting, "findOne")
      .mockResolvedValue({ fee: 20 } as any);

    const createdOrder: any = {
      id: 42,
      userId: 9,
      status: OrderStatus.Processing,
      totalPrice: 0,
    };
    jest.spyOn(Order, "create").mockImplementation((data: any) => {
      Object.assign(createdOrder, data);
      return createdOrder;
    });
    const orderSaveSpy = jest
      .spyOn(Order, "save")
      .mockImplementation(async (o: any) => o);
    jest.spyOn(OrderItem, "create").mockImplementation((data: any) => data);
    const orderItemSaveSpy = jest
      .spyOn(OrderItem, "save")
      .mockResolvedValue([] as any);
    const cartRemoveSpy = jest
      .spyOn(CartItem, "remove")
      .mockResolvedValue([] as any);

    const payload: CreateOrderRequest = {
      code: "fix10",
      fullName: "John Doe",
      phone: "+998901234567",
      email: "john@example.com",
    };
    const result = await handler.execute(new CreateOrderCommand(9, payload));

    // book1 uses discountPrice (80) * qty 2 = 160; book2 uses price (50) * qty 1 = 50
    // subtotal = 210, coupon discount fixed 10 -> 200, + delivery fee 20 = 220
    expect(createdOrder.totalPrice).toBe(220);
    expect(result.totalPrice).toBe(220);
    expect(result.status).toBe(OrderStatus.Processing);
    expect(createdOrder.orderNumber).toEqual(expect.any(String));
    expect(result.orderNumber).toEqual(expect.any(String));
    expect(result.fullName).toBe("John Doe");
    expect(result.phone).toBe("+998901234567");
    expect(result.email).toBe("john@example.com");

    expect(orderSaveSpy).toHaveBeenCalled();
    expect(orderItemSaveSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        orderId: 42,
        bookId: 1,
        price: 80,
        quantity: 2,
      }),
      expect.objectContaining({
        orderId: 42,
        bookId: 2,
        price: 50,
        quantity: 1,
      }),
    ]);
    expect(cartRemoveSpy).toHaveBeenCalledWith(cartItems);
  });
});
