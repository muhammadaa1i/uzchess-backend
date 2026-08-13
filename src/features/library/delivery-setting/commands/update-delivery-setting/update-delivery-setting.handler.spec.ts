import {
    UpdateDeliverySettingHandler
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.handler";
import {
    UpdateDeliverySettingCommand
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.command";
import {
    UpdateDeliverySettingRequest
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.request";
import {DeliverySetting} from "@/features/library/entities/delivery-setting/delivery-setting.entity";

describe("UpdateDeliverySettingHandler", () => {
    let handler: UpdateDeliverySettingHandler;

    beforeEach(() => {
        handler = new UpdateDeliverySettingHandler();
    });

    afterEach(() => jest.restoreAllMocks());

    it("creates a new row when no delivery setting exists yet (upsert-create)", async () => {
        jest.spyOn(DeliverySetting, "findOne").mockResolvedValue(null);
        const createSpy = jest.spyOn(DeliverySetting, "create").mockImplementation(
            (data: any) =>
                ({
                    ...data, save: jest.fn().mockImplementation(async function (this: any) {
                        return this;
                    })
                }) as any,
        );

        const payload: UpdateDeliverySettingRequest = {fee: 15};
        const result = await handler.execute(new UpdateDeliverySettingCommand(payload));

        expect(createSpy).toHaveBeenCalledWith({fee: 15});
        expect(result.fee).toBe(15);
    });

    it("updates the existing row when a delivery setting already exists (upsert-update)", async () => {
        const existing: any = {id: 1, fee: 5, save: jest.fn()};
        existing.save.mockImplementation(async () => ({...existing}));
        jest.spyOn(DeliverySetting, "findOne").mockResolvedValue(existing);
        const createSpy = jest.spyOn(DeliverySetting, "create");

        const payload: UpdateDeliverySettingRequest = {fee: 30};
        const result = await handler.execute(new UpdateDeliverySettingCommand(payload));

        expect(createSpy).not.toHaveBeenCalled();
        expect(existing.fee).toBe(30);
        expect(existing.save).toHaveBeenCalled();
        expect(result.fee).toBe(30);
    });
});
