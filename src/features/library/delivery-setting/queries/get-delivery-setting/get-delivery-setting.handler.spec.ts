import { GetDeliverySettingHandler } from "@/features/library/delivery-setting/queries/get-delivery-setting/get-delivery-setting.handler";
import { DeliverySetting } from "@/features/library/entities/delivery-setting/delivery-setting.entity";

describe("GetDeliverySettingHandler", () => {
  let handler: GetDeliverySettingHandler;

  beforeEach(() => {
    handler = new GetDeliverySettingHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the stored fee when a row exists", async () => {
    jest.spyOn(DeliverySetting, "findOne").mockResolvedValue({ id: 1, fee: 25 } as any);

    const result = await handler.execute();

    expect(result.fee).toBe(25);
  });

  it("defaults to fee 0 when no row exists", async () => {
    jest.spyOn(DeliverySetting, "findOne").mockResolvedValue(null);

    const result = await handler.execute();

    expect(result.fee).toBe(0);
  });
});
