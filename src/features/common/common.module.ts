import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CourseModule } from "@/features/common/courses/course.module";
import { RatingModule } from "@/features/common/rating/rating.module";
import { FavouriteModule } from "@/features/common/favourite/favourite.module";
import { SectionModule } from "@/features/common/section/section.module";
import { LessonModule } from "@/features/common/lesson/lesson.module";
import { CategoryModule } from "@/features/common/category/category.module";
import { PurchaseModule } from "@/features/common/purchase/purchase.module";

@Module({
  imports: [
    CqrsModule,
    CourseModule,
    RatingModule,
    FavouriteModule,
    SectionModule,
    LessonModule,
    CategoryModule,
    PurchaseModule,
  ],
})
export class CommonModule {}
