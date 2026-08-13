import {ApiProperty} from "@nestjs/swagger";
import {IsInt, Min} from "class-validator";

export class UpdateDeliverySettingRequest {
    @ApiProperty()
    @IsInt()
    @Min(0)
    fee: number;
}
