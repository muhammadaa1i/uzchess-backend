import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateSectionCommand } from "@/features/common/section/commands/update-section/update-section.command";
import { CourseSection } from "@/features/common/entities/section/course-section.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { plainToInstance } from "class-transformer";
import { UpdateSectionResponse } from "@/features/common/section/commands/update-section/update-section.response";
import { Cache } from "@nestjs/cache-manager";
import {
  sectionByIdCacheKey,
  sectionsListCacheKey,
} from "@/features/common/section/section.cache";
import { courseByIdCacheKey } from "@/features/common/courses/course.cache";

@CommandHandler(UpdateSectionCommand)
export class UpdateSectionHandler implements ICommandHandler<UpdateSectionCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateSectionCommand) {
    const section = await CourseSection.findOneBy({ id: cmd.id });
    DoesNotExistException.ThrowIfNull(section, "Section not found");

    if (cmd.payload.title !== undefined) section.title = cmd.payload.title;
    if (cmd.payload.order !== undefined) section.order = cmd.payload.order;

    const saved = await section.save();

    await Promise.all([
      this.cache.del(sectionsListCacheKey(section.courseId)),
      this.cache.del(sectionByIdCacheKey(cmd.id)),
      this.cache.del(courseByIdCacheKey(section.courseId)),
    ]);

    return plainToInstance(UpdateSectionResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
