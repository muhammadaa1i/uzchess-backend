import {Body, Controller, Get, Patch} from "@nestjs/common";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {
    GetDeliverySettingQuery
} from "@/features/library/delivery-setting/queries/get-delivery-setting/get-delivery-setting.query";
import {
    GetDeliverySettingResponse
} from "@/features/library/delivery-setting/queries/get-delivery-setting/get-delivery-setting.response";
import {
    UpdateDeliverySettingCommand
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.command";
import {
    UpdateDeliverySettingRequest
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.request";
import {
    UpdateDeliverySettingResponse
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.response";
import {Roles} from "@/core/decorators/roles.decorator";
import {Role} from "@/core/enums/role.enum";

@ApiTags("Delivery Setting")
@Roles(Role.Admin)
@Controller("delivery-setting")
export class DeliverySettingController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Get()
    @ApiOkResponse({type: GetDeliverySettingResponse})
    async getById() {
        return await this.queryBus.execute(new GetDeliverySettingQuery());
    }

    @Patch()
    @ApiOkResponse({type: UpdateDeliverySettingResponse})
    async update(@Body() payload: UpdateDeliverySettingRequest) {
        return await this.cmdBus.execute(new UpdateDeliverySettingCommand(payload));
    }
}
