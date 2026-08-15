import { BadRequestException } from "@nestjs/common";
import { UpdateOrderStatusHandler } from "@/features/library/order/commands/update-order-status/update-order-status.handler";
import { UpdateOrderStatusCommand } from "@/features/library/order/commands/update-order-status/update-order-status.command";
import { UpdateOrderStatusRequest } from "@/features/library/order/commands/update-order-status/update-order-status.request";
import { Order } from "@/features/library/entities/order/order.entity";
import { OrderStatus } from "@/core/enums/order-status.enum";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("UpdateOrderStatusHandler", () => {
  let handler: UpdateOrderStatusHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new UpdateOrderStatusHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException when the order doesn't exist", async () => {
    jest.spyOn(Order, "findOneBy").mockResolvedValue(null);

    const payload: UpdateOrderStatusRequest = { status: OrderStatus.Delivered };
    await expect(
      handler.execute(new UpdateOrderStatusCommand(404, payload)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("updates the order status and saves it (happy path transition)", async () => {
    const order: any = {
      id: 1,
      userId: 9,
      status: OrderStatus.Processing,
      totalPrice: 220,
      createdAt: "2026-01-01T00:00:00.000Z",
      save: jest.fn(),
    };
    order.save.mockImplementation(async () => order);
    jest.spyOn(Order, "findOneBy").mockResolvedValue(order);

    const payload: UpdateOrderStatusRequest = { status: OrderStatus.Delivered };
    const result = await handler.execute(new UpdateOrderStatusCommand(1, payload));

    expect(order.status).toBe(OrderStatus.Delivered);
    expect(order.save).toHaveBeenCalled();
    expect(result.status).toBe(OrderStatus.Delivered);
    expect(result.id).toBe(1);
    expect(result.totalPrice).toBe(220);
  });

  it("allows Processing -> Cancelled", async () => {
    const order: any = {
      id: 2,
      userId: 9,
      status: OrderStatus.Processing,
      totalPrice: 100,
      createdAt: "2026-01-01T00:00:00.000Z",
      save: jest.fn(),
    };
    order.save.mockImplementation(async () => order);
    jest.spyOn(Order, "findOneBy").mockResolvedValue(order);

    const payload: UpdateOrderStatusRequest = { status: OrderStatus.Cancelled };
    const result = await handler.execute(new UpdateOrderStatusCommand(2, payload));

    expect(order.status).toBe(OrderStatus.Cancelled);
    expect(result.status).toBe(OrderStatus.Cancelled);
  });

  // Delivered and Cancelled are both terminal states — no transition out of
  // either is allowed, including re-setting the same status.
  it.each([
    [OrderStatus.Delivered, OrderStatus.Cancelled],
    [OrderStatus.Delivered, OrderStatus.Processing],
    [OrderStatus.Delivered, OrderStatus.Delivered],
    [OrderStatus.Cancelled, OrderStatus.Delivered],
    [OrderStatus.Cancelled, OrderStatus.Processing],
    [OrderStatus.Cancelled, OrderStatus.Cancelled],
    [OrderStatus.Processing, OrderStatus.Processing],
  ])(
    "rejects %s -> %s with BadRequestException and never saves",
    async (from, to) => {
      const order: any = {
        id: 3,
        userId: 9,
        status: from,
        totalPrice: 100,
        createdAt: "2026-01-01T00:00:00.000Z",
        save: jest.fn(),
      };
      jest.spyOn(Order, "findOneBy").mockResolvedValue(order);

      const payload: UpdateOrderStatusRequest = { status: to };
      await expect(
        handler.execute(new UpdateOrderStatusCommand(3, payload)),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(order.status).toBe(from);
      expect(order.save).not.toHaveBeenCalled();
    },
  );
});
