import { GetCartSummaryHandler } from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.handler";
import { GetCartSummaryQuery } from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.query";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { DeliverySetting } from "@/features/library/entities/delivery-setting/delivery-setting.entity";
import { Coupon } from "@/features/library/entities/coupon/coupon.entity";

describe("GetCartSummaryHandler", () => {
  let handler: GetCartSummaryHandler;

  beforeEach(() => {
    handler = new GetCartSummaryHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("computes subtotal and itemDiscount across cart items", async () => {
    jest.spyOn(CartItem, "findBy").mockResolvedValue([
      { bookId: 1, quantity: 2 },
      { bookId: 2, quantity: 1 },
    ] as any);
    jest.spyOn(Book, "find").mockResolvedValue([
      { id: 1, price: 100, discountPrice: 80 },
      { id: 2, price: 50, discountPrice: null },
    ] as any);
    jest.spyOn(DeliverySetting, "findOne").mockResolvedValue({ fee: 0 } as any);

    const result = await handler.execute(new GetCartSummaryQuery(9, { code: undefined } as any));

    // subtotal = 100*2 + 50*1 = 250
    expect(result.subtotal).toBe(250);
    // itemDiscount = (100-80)*2 = 40
    expect(result.itemDiscount).toBe(40);
    expect(result.couponCode).toBeNull();
    expect(result.couponDiscount).toBe(0);
  });

  it("applies the delivery fee when the cart is non-empty", async () => {
    jest.spyOn(CartItem, "findBy").mockResolvedValue([{ bookId: 1, quantity: 1 }] as any);
    jest.spyOn(Book, "find").mockResolvedValue([
      { id: 1, price: 100, discountPrice: null },
    ] as any);
    const deliveryFindSpy = jest
      .spyOn(DeliverySetting, "findOne")
      .mockResolvedValue({ fee: 20 } as any);

    const result = await handler.execute(new GetCartSummaryQuery(9, { code: undefined } as any));

    expect(deliveryFindSpy).toHaveBeenCalledWith({ where: {} });
    expect(result.deliveryFee).toBe(20);
    expect(result.total).toBe(120);
  });

  it("does not apply (or even look up) the delivery fee when the cart is empty", async () => {
    jest.spyOn(CartItem, "findBy").mockResolvedValue([]);
    const bookFindSpy = jest.spyOn(Book, "find");
    const deliveryFindSpy = jest.spyOn(DeliverySetting, "findOne");

    const result = await handler.execute(new GetCartSummaryQuery(9, { code: undefined } as any));

    expect(bookFindSpy).not.toHaveBeenCalled();
    expect(deliveryFindSpy).not.toHaveBeenCalled();
    expect(result.subtotal).toBe(0);
    expect(result.itemDiscount).toBe(0);
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(0);
  });

  it("applies a coupon discount on top of item discounts", async () => {
    jest.spyOn(CartItem, "findBy").mockResolvedValue([{ bookId: 1, quantity: 1 }] as any);
    jest.spyOn(Book, "find").mockResolvedValue([
      { id: 1, price: 100, discountPrice: null },
    ] as any);
    jest.spyOn(DeliverySetting, "findOne").mockResolvedValue({ fee: 0 } as any);
    jest.spyOn(Coupon, "findOne").mockResolvedValue({
      code: "SAVE10",
      type: "fixed",
      value: 10,
      isActive: true,
      expiresAt: null,
    } as any);

    const result = await handler.execute(new GetCartSummaryQuery(9, { code: "save10" } as any));

    expect(result.couponCode).toBe("SAVE10");
    expect(result.couponDiscount).toBe(10);
    expect(result.total).toBe(90);
  });
});
