import {Module} from "@nestjs/common";
import {DifficultyController} from "@/features/library/difficulty/difficulty.controller";
import {CqrsModule} from "@nestjs/cqrs";
import {
    CreateDifficultyHandler
} from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.handler";

@Module({
    imports: [CqrsModule],
    controllers: [DifficultyController],
    providers: [
        CreateDifficultyHandler
    ]
})

export class DifficultyModule {
}