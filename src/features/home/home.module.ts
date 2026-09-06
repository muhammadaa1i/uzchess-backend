import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {PlayerModule} from "@/features/home/player/player.module";
import {GameModule} from "@/features/home/game/game.module";
import {GameOfDayModule} from "@/features/home/game-of-day/game-of-day.module";
import {NewsModule} from "@/features/home/news/news.module";
import {BannerModule} from "@/features/home/banner/banner.module";
import {ContactModule} from "@/features/home/contact/contact.module";

@Module({
    imports: [
        CqrsModule,
        PlayerModule,
        GameModule,
        GameOfDayModule,
        NewsModule,
        BannerModule,
        ContactModule,
    ],
})
export class HomeModule {
}
