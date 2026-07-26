import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetLanguagesQuery } from "@/features/library/languages/queries/get-languages/get-languages.query";
import { Language } from "../../../entities/languages/language.entity";
import { FindOptionsWhere, ILike } from "typeorm";
import { plainToInstance } from "class-transformer";
import { GetLanguagesResponse } from "@/features/library/languages/queries/get-languages/get-languages.response";
import { Cache } from "@nestjs/cache-manager";
import { LANGUAGES_LIST_CACHE_KEY } from "@/features/library/languages/languages.cache";

@QueryHandler(GetLanguagesQuery)
export class GetLanguagesHandler implements IQueryHandler<GetLanguagesQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetLanguagesQuery) {
    if (!query.search) {
      const cached = await this.cache.get<GetLanguagesResponse[]>(
        LANGUAGES_LIST_CACHE_KEY,
      );
      if (cached) return cached;
    }

    const where: FindOptionsWhere<Language> = {};
    if (query.search) where.title = ILike(`%${query.search}%`);

    const languages = await Language.find({ where });

    const result = plainToInstance(GetLanguagesResponse, languages, {
      excludeExtraneousValues: true,
    });

    if (!query.search) await this.cache.set(LANGUAGES_LIST_CACHE_KEY, result);

    return result;
  }
}
