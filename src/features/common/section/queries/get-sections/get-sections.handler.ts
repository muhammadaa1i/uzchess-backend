import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetSectionsQuery } from "@/features/common/section/queries/get-sections/get-sections.query";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { plainToInstance } from "class-transformer";
import { GetSectionsResponse } from "@/features/common/section/queries/get-sections/get-sections.response";
import { Cache } from "@nestjs/cache-manager";
import { sectionsListCacheKey } from "@/features/common/section/section.cache";

@QueryHandler(GetSectionsQuery)
export class GetSectionsHandler implements IQueryHandler<GetSectionsQuery> {
  constructor(private readonly cache: Cache) {}

  async execute(query: GetSectionsQuery) {
    const cacheKey = sectionsListCacheKey(query.payload.courseId);
    const cached = await this.cache.get<GetSectionsResponse[]>(cacheKey);
    if (cached) return cached;

    const sections = await CourseSection.find({
      where: { courseId: query.payload.courseId },
      order: { order: "ASC" },
    });

    const result = plainToInstance(GetSectionsResponse, sections, {
      excludeExtraneousValues: true,
    });

    await this.cache.set(cacheKey, result);

    return result;
  }
}
