import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetLanguagesByIdQuery } from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.query";
import { Language } from "../../../entities/languages/language.entity";
import { plainToInstance } from "class-transformer";
import { GetLanguagesByIdResponse } from "@/features/library/languages/queries/get-languages-by-id/get-languages-by-id.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import { languageByIdCacheKey } from "@/features/library/languages/languages.cache";

@QueryHandler(GetLanguagesByIdQuery)
export class GetLanguagesByIdHandler implements IQueryHandler<GetLanguagesByIdQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetLanguagesByIdQuery) {
    const cacheKey = languageByIdCacheKey(query.id);
    const cached = await this.cache.get<GetLanguagesByIdResponse>(cacheKey);
    if (cached) return cached;

    const language = await Language.findOneBy({ id: query.id });
    DoesNotExistException.ThrowIfNull(language, "Language not found");

    const result = plainToInstance(GetLanguagesByIdResponse, language, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
