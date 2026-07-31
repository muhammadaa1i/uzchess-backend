import { Type } from "@nestjs/common";
import { AuthModule } from "@/features/auth/auth.module";
import { BookModule } from "@/features/library/book/book.module";
import { AuthorModule } from "@/features/library/author/author.module";
import { DifficultyModule } from "@/features/library/difficulty/difficulty.module";
import { LanguagesModule } from "@/features/library/languages/languages.module";
import { CartModule } from "@/features/library/cart/cart.module";
import { CategoryModule as BookCategoryModule } from "@/features/library/category/category.module";
import { RatingModule as BookRatingModule } from "@/features/library/rating/rating.module";
import { FavouriteModule as BookFavouriteModule } from "@/features/library/favourite/favourite.module";
import { CourseModule } from "@/features/common/courses/course.module";
import { SectionModule } from "@/features/common/section/section.module";
import { LessonModule } from "@/features/common/lesson/lesson.module";
import { PurchaseModule } from "@/features/common/purchase/purchase.module";
import { ProgressModule } from "@/features/common/progress/progress.module";
import { CategoryModule as CourseCategoryModule } from "@/features/common/category/category.module";
import { RatingModule as CourseRatingModule } from "@/features/common/rating/rating.module";
import { FavouriteModule as CourseFavouriteModule } from "@/features/common/favourite/favourite.module";

export interface SwaggerDocGroup {
  path: string;
  title: string;
  include: Type<unknown>[];
}

export const SWAGGER_DOC_GROUPS: SwaggerDocGroup[] = [
  {
    path: "swagger/books",
    title: "UzChess Backend API - Books",
    include: [
      BookModule,
      BookCategoryModule,
      BookRatingModule,
      AuthorModule,
      DifficultyModule,
      LanguagesModule,
    ],
  },
  {
    path: "swagger/courses",
    title: "UzChess Backend API - Courses",
    include: [
      CourseModule,
      CourseCategoryModule,
      CourseRatingModule,
      PurchaseModule,
      SectionModule,
      LessonModule,
      ProgressModule,
    ],
  },
  {
    path: "swagger/account",
    title: "UzChess Backend API - Account",
    include: [
      AuthModule,
      CartModule,
      BookFavouriteModule,
      CourseFavouriteModule,
    ],
  },
];
