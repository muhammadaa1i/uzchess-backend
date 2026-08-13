import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {
    GetDeliverySettingQuery
} from "@/features/library/delivery-setting/queries/get-delivery-setting/get-delivery-setting.query";
import {DeliverySetting} from "@/features/library/entities/delivery-setting/delivery-setting.entity";
import {plainToInstance} from "class-transformer";
import {
    GetDeliverySettingResponse
} from "@/features/library/delivery-setting/queries/get-delivery-setting/get-delivery-setting.response";

@QueryHandler(GetDeliverySettingQuery)
export class GetDeliverySettingHandler implements IQueryHandler<GetDeliverySettingQuery> {
    async execute() {
        const setting = await DeliverySetting.findOne({where: {}});

        return plainToInstance(
            GetDeliverySettingResponse,
            {fee: setting?.fee ?? 0},
            {excludeExtraneousValues: true},
        );
    }
}
