import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class GetCartSummaryResponse {
    @ApiProperty()
    @Expose()
    subtotal: number;

    @ApiProperty()
    @Expose()
    itemDiscount: number;

    @ApiProperty({required: false, nullable: true})
    @Expose()
    couponCode: string | null;

    @ApiProperty()
    @Expose()
    couponDiscount: number;

    @ApiProperty()
    @Expose()
    deliveryFee: number;

    @ApiProperty()
    @Expose()
    total: number;
}
