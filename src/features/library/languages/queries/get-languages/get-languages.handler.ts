import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetLanguagesQuery} from "@/features/library/languages/queries/get-languages/get-languages.query";
import {Language} from "../../../entities/languages/language.entity";
import {FindOptionsWhere, ILike} from "typeorm";
import {plainToInstance} from "class-transformer";
import {GetLanguagesResponse} from "@/features/library/languages/queries/get-languages/get-languages.response";

@QueryHandler(GetLanguagesQuery)
export class GetLanguagesHandler implements IQueryHandler<GetLanguagesQuery> {
    async execute(query: GetLanguagesQuery) {
        const where: FindOptionsWhere<Language> = {}
        if (query.search) where.title = ILike(`%${query.search}%`)

        const languages = await Language.find({where})

        return plainToInstance(GetLanguagesResponse, languages, {
            excludeExtraneousValues: true,
        })
    }
}
