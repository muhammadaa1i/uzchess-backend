import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SectionController } from "@/features/common/section/section.controller";
import { CreateSectionHandler } from "@/features/common/section/commands/create-section/create-section.handler";
import { UpdateSectionHandler } from "@/features/common/section/commands/update-section/update-section.handler";
import { DeleteSectionHandler } from "@/features/common/section/commands/delete-section/delete-section.handler";
import { GetSectionsHandler } from "@/features/common/section/queries/get-sections/get-sections.handler";
import { GetSectionsByIdHandler } from "@/features/common/section/queries/get-sections-by-id/get-sections-by-id.handler";

@Module({
  imports: [CqrsModule],
  controllers: [SectionController],
  providers: [
    GetSectionsHandler,
    GetSectionsByIdHandler,
    CreateSectionHandler,
    UpdateSectionHandler,
    DeleteSectionHandler,
  ],
})
export class SectionModule {}
