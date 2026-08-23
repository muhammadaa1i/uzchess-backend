import { CreatePurchaseHandler } from "@/features/common/purchase/commands/create-purchase/create-purchase.handler";
import { CreatePurchaseCommand } from "@/features/common/purchase/commands/create-purchase/create-purchase.command";
import { CreatePurchaseRequest } from "@/features/common/purchase/commands/create-purchase/create-purchase.request";
import { Course } from "@/features/common/entities/course/course.entity";
import { CoursePurchase } from "@/features/common/entities/purchase/course-purchase.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { PurchaseStatus } from "@/core/enums/purchase-status/purchase-status.enum";
import { PaymentProvider } from "@/core/enums/payment-provider/payment-provider.enum";

describe("CreatePurchaseHandler", () => {
  let handler: CreatePurchaseHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const payload = (overrides: Partial<CreatePurchaseRequest> = {}) =>
    ({
      provider: PaymentProvider.Payme,
      ...overrides,
    }) as CreatePurchaseRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new CreatePurchaseHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the course doesn't exist", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue(null);
    const purchaseFindSpy = jest.spyOn(CoursePurchase, "findOneBy");
    const createSpy = jest.spyOn(CoursePurchase, "create");

    await expect(
      handler.execute(new CreatePurchaseCommand(9, 1, payload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(purchaseFindSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when the course is already purchased", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue({ id: 1 } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue({
      id: 5,
      courseId: 1,
      userId: 9,
      status: PurchaseStatus.Success,
    } as any);
    const createSpy = jest.spyOn(CoursePurchase, "create");
    const saveSpy = jest.spyOn(CoursePurchase, "save");

    await expect(
      handler.execute(new CreatePurchaseCommand(9, 1, payload())),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(createSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("creates the purchase and marks it Success regardless of the requested provider (provider enum validity is enforced by class-validator on the request DTO, not by the handler)", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValue({ id: 1 } as any);
    jest.spyOn(CoursePurchase, "findOneBy").mockResolvedValue(null);
    const createSpy = jest.spyOn(CoursePurchase, "create").mockReturnValue({
      courseId: 1,
      userId: 9,
      status: PurchaseStatus.Pending,
    } as any);
    const saveSpy = jest
      .spyOn(CoursePurchase, "save")
      .mockImplementation(async (entity: any) => entity);

    const result = await handler.execute(
      new CreatePurchaseCommand(9, 1, payload({ provider: PaymentProvider.Click })),
    );

    expect(createSpy).toHaveBeenCalledWith({
      courseId: 1,
      userId: 9,
      status: PurchaseStatus.Pending,
    });
    // saved once as Pending, then again after the status flips to Success
    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(result.status).toBe(PurchaseStatus.Success);
    expect(result.courseId).toBe(1);
    expect(result.userId).toBe(9);
  });
});
