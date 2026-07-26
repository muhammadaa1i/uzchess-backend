import { Module } from "@nestjs/common";
import { DifficultyController } from "@/features/library/difficulty/difficulty.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateDifficultyHandler } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.handler";
import { UpdateDifficultyHandler } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.handler";
import { DeleteDifficultyHandler } from "@/features/library/difficulty/commands/delete-difficulty/delete-difficulty.handler";
import { GetDifficultiesHandler } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.handler";
import { GetDifficultiesByIdHandler } from "@/features/library/difficulty/queries/get-difficulty-by-id/get-difficulties-by-id.handler";

@Module({
  imports: [CqrsModule],
  controllers: [DifficultyController],
  providers: [
    GetDifficultiesHandler,
    GetDifficultiesByIdHandler,
    CreateDifficultyHandler,
    UpdateDifficultyHandler,
    DeleteDifficultyHandler,
  ],
})
export class DifficultyModule {}
