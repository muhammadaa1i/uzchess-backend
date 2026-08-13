import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthorModule } from "@/features/library/author/author.module";
import { CategoryModule } from "@/features/library/category/category.module";
import { DifficultyModule } from "@/features/library/difficulty/difficulty.module";
import { LanguagesModule } from "@/features/library/languages/languages.module";
import { BookModule } from "@/features/library/book/book.module";
import { RatingModule } from "@/features/library/rating/rating.module";
import { CartModule } from "@/features/library/cart/cart.module";
import { FavouriteModule } from "@/features/library/favourite/favourite.module";
import { OrderModule } from "@/features/library/order/order.module";
import { CouponModule } from "@/features/library/coupon/coupon.module";
import { DeliverySettingModule } from "@/features/library/delivery-setting/delivery-setting.module";

@Module({
  imports: [
    CqrsModule,
    AuthorModule,
    CategoryModule,
    DifficultyModule,
    LanguagesModule,
    BookModule,
    RatingModule,
    CartModule,
    FavouriteModule,
    OrderModule,
    CouponModule,
    DeliverySettingModule,
  ],
})
export class LibraryModule {}
