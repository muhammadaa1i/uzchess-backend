import {
    UpdateDeliverySettingRequest
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.request";

export class UpdateDeliverySettingCommand {
    constructor(public readonly payload: UpdateDeliverySettingRequest) {
    }
}
