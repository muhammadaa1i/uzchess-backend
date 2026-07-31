import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";
import {PurchaseStatus} from "@/core/enums/purchase-status.enum";

export class CreatePurchaseResponse {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    courseId: number;

    @ApiProperty()
    @Expose()
    userId: number;

    @ApiProperty({enum: PurchaseStatus})
    @Expose()
    status: PurchaseStatus;
}
