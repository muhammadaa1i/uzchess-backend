import {IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {GetSectionsByIdQuery} from "@/features/common/section/queries/get-sections-by-id/get-sections-by-id.query";
import {CourseSection} from "@/features/common/entities/section/course-section.entity";
import {plainToInstance} from "class-transformer";
import {
    GetSectionsByIdResponse
} from "@/features/common/section/queries/get-sections-by-id/get-sections-by-id.response";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {Cache} from "@nestjs/cache-manager";
import {sectionByIdCacheKey} from "@/features/common/section/section.cache";

@QueryHandler(GetSectionsByIdQuery)
export class GetSectionsByIdHandler
    implements IQueryHandler<GetSectionsByIdQuery> {
    constructor(private readonly cache: Cache) {
    }

    async execute(query: GetSectionsByIdQuery) {
        const cacheKey = sectionByIdCacheKey(query.id);
        const cached = await this.cache.get<GetSectionsByIdResponse>(cacheKey);
        if (cached) return cached;

        const section = await CourseSection.findOneBy({id: query.id});
        DoesNotExistException.ThrowIfNull(section, "Section not found");

        const result = plainToInstance(GetSectionsByIdResponse, section, {
            excludeExtraneousValues: true,
        });

        await this.cache.set(cacheKey, result);

        return result;
    }
}
