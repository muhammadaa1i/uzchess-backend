import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {DeliverySettingController} from "@/features/library/delivery-setting/delivery-setting.controller";
import {
    GetDeliverySettingHandler
} from "@/features/library/delivery-setting/queries/get-delivery-setting/get-delivery-setting.handler";
import {
    UpdateDeliverySettingHandler
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.handler";

@Module({
    imports: [CqrsModule],
    controllers: [DeliverySettingController],
    providers: [GetDeliverySettingHandler, UpdateDeliverySettingHandler],
})
export class DeliverySettingModule {
}
