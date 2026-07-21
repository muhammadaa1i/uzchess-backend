import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {AuthorModule} from "@/features/book/author/author.module";
import {CategoryModule} from "@/features/book/category/category.module";
import {DifficultyModule} from "@/features/book/difficulty/difficulty.module";

@Module({
    imports: [
        CqrsModule,
        AuthorModule,
        CategoryModule,
        DifficultyModule
    ]
})

export class LibraryModule {
}