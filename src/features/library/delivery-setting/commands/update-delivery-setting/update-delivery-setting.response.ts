import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class UpdateDeliverySettingResponse {
    @ApiProperty()
    @Expose()
    fee: number;
}
