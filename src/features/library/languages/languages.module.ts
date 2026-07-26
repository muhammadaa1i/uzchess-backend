import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { LanguagesController } from "@/features/library/languages/languages.controller";
import { CreateLanguageHandler } from "@/features/library/languages/commands/create-language/create-language.handler";
import { UpdateLanguageHandler } from "@/features/library/languages/commands/update-language/update-language.handler";
import { DeleteLanguageHandler } from "@/features/library/languages/commands/delete-language/delete-language.handler";
import { GetLanguagesHandler } from "@/features/library/languages/queries/get-languages/get-languages.handler";
import { GetLanguagesByIdHandler } from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.handler";

@Module({
  imports: [CqrsModule],
  controllers: [LanguagesController],
  providers: [
    GetLanguagesHandler,
    GetLanguagesByIdHandler,
    CreateLanguageHandler,
    UpdateLanguageHandler,
    DeleteLanguageHandler,
  ],
})
export class LanguagesModule {}
