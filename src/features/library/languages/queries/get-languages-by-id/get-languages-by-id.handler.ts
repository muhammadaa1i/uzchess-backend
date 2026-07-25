import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetLanguagesByIdQuery} from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.query";
import {Language} from "../../../entities/languages/language.entity";
import {plainToInstance} from "class-transformer";
import {GetLanguagesByIdResponse} from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";

@QueryHandler(GetLanguagesByIdQuery)
export class GetLanguagesByIdHandler implements IQueryHandler<GetLanguagesByIdQuery> {
    async execute(query: GetLanguagesByIdQuery) {
        const language = await Language.findOneBy({id: query.id})
        DoesNotExistException.ThrowIfNull(language, "Language not found")

        return plainToInstance(GetLanguagesByIdResponse, language, {
            excludeExtraneousValues: true,
        })
    }
}
