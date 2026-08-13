import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {
    UpdateDeliverySettingCommand
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.command";
import {DeliverySetting} from "@/features/library/entities/delivery-setting/delivery-setting.entity";
import {plainToInstance} from "class-transformer";
import {
    UpdateDeliverySettingResponse
} from "@/features/library/delivery-setting/commands/update-delivery-setting/update-delivery-setting.response";

@CommandHandler(UpdateDeliverySettingCommand)
export class UpdateDeliverySettingHandler implements ICommandHandler<UpdateDeliverySettingCommand> {
    async execute(cmd: UpdateDeliverySettingCommand) {
        let setting = await DeliverySetting.findOne({where: {}});

        if (setting) {
            setting.fee = cmd.payload.fee;
        } else {
            setting = DeliverySetting.create({fee: cmd.payload.fee});
        }
        const saved = await setting.save();

        return plainToInstance(UpdateDeliverySettingResponse, saved, {
            excludeExtraneousValues: true,
        });
    }
}
