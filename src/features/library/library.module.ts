import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {AuthorModule} from "@/features/library/author/author.module";
import {CategoryModule} from "@/features/library/category/category.module";
import {DifficultyModule} from "@/features/library/difficulty/difficulty.module";
import {LanguagesModule} from "@/features/library/languages/languages.module";
import {BookModule} from "@/features/library/book/book.module";
import {RatingModule} from "@/features/library/rating/rating.module";

@Module({
    imports: [
        CqrsModule,
        AuthorModule,
        CategoryModule,
        DifficultyModule,
        LanguagesModule,
        BookModule,
        RatingModule
    ]
})

export class LibraryModule {
}