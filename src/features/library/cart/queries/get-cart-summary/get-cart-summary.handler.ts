import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetCartSummaryQuery} from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.query";
import {CartItem} from "@/features/library/entities/cart/cart-item.entity";
import {Book} from "@/features/library/entities/book/book.entity";
import {DeliverySetting} from "@/features/library/entities/delivery-setting/delivery-setting.entity";
import {In} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetCartSummaryResponse} from "@/features/library/cart/queries/get-cart-summary/get-cart-summary.response";
import {resolveCoupon} from "@/core/utils/cart-pricing/cart-pricing.util";

@QueryHandler(GetCartSummaryQuery)
export class GetCartSummaryHandler implements IQueryHandler<GetCartSummaryQuery> {
    async execute(query: GetCartSummaryQuery) {
        const cartItems = await CartItem.findBy({userId: query.userId});
        const bookIds = cartItems.map((item) => item.bookId);

        const books = bookIds.length
            ? await Book.find({where: {id: In(bookIds)}})
            : [];
        const bookById = new Map(books.map((book) => [book.id, book]));

        let subtotal = 0;
        let itemDiscount = 0;
        for (const item of cartItems) {
            const book = bookById.get(item.bookId);
            if (!book) continue;
            subtotal += book.price * item.quantity;
            if (book.discountPrice)
                itemDiscount += (book.price - book.discountPrice) * item.quantity;
        }

        const {couponCode, couponDiscount} = await resolveCoupon(
            query.payload.code,
            subtotal - itemDiscount,
        );

        const deliverySetting = cartItems.length
            ? await DeliverySetting.findOne({where: {}})
            : null;
        const deliveryFee = deliverySetting?.fee ?? 0;

        const total = Math.max(
            0,
            subtotal - itemDiscount - couponDiscount + deliveryFee,
        );

        return plainToInstance(
            GetCartSummaryResponse,
            {
                subtotal,
                itemDiscount,
                couponCode,
                couponDiscount,
                deliveryFee,
                total,
            },
            {excludeExtraneousValues: true},
        );
    }
}
