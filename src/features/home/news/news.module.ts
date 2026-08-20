import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {NewsController} from "@/features/home/news/news.controller";
import {CreateNewsHandler} from "@/features/home/news/commands/create-news/create-news.handler";
import {UpdateNewsHandler} from "@/features/home/news/commands/update-news/update-news.handler";
import {DeleteNewsHandler} from "@/features/home/news/commands/delete-news/delete-news.handler";
import {GetNewsHandler} from "@/features/home/news/queries/get-news/get-news.handler";
import {GetNewsByIdHandler} from "@/features/home/news/queries/get-news-by-id/get-news-by-id.handler";

@Module({
    imports: [CqrsModule],
    controllers: [NewsController],
    providers: [
        GetNewsHandler,
        GetNewsByIdHandler,
        CreateNewsHandler,
        UpdateNewsHandler,
        DeleteNewsHandler,
    ],
})
export class NewsModule {
}
