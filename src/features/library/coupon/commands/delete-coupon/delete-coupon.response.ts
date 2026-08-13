import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class DeleteCouponResponse {
    @ApiProperty()
    @Expose()
    message: string;
}
