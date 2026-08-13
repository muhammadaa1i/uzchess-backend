import {GetCartSummaryRequest} from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.request";

export class GetCartSummaryQuery {
    constructor(
        public readonly userId: number,
        public readonly payload: GetCartSummaryRequest,
    ) {
    }
}
