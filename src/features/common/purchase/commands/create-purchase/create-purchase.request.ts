import {ApiProperty} from "@nestjs/swagger";
import {IsEnum} from "class-validator";
import {PaymentProvider} from "@/core/enums/payment-provider.enum";

export class CreatePurchaseRequest {
    @ApiProperty({enum: PaymentProvider})
    @IsEnum(PaymentProvider)
    provider: PaymentProvider;
}
