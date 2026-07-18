import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {AuthorModule} from "@/features/library/author/author.module";
import {CategoryModule} from "@/features/library/category/category.module";
import {DifficultyModule} from "@/features/library/difficulty/difficulty.module";

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