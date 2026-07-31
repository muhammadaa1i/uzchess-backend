import {PaymentProvider} from "@/core/enums/payment-provider.enum";

export class CreatePurchaseCommand {
    constructor(
        public readonly userId: number,
        public readonly courseId: number,
        public readonly provider: PaymentProvider,
    ) {
    }
}
