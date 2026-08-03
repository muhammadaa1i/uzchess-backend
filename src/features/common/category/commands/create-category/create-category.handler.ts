import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCourseCategoryCommand } from "@/features/common/category/commands/create-category/create-category.command";
import { CoursesCategory } from "@/features/common/entities/category/courses-category.entity";
import { ILike } from "typeorm";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { CreateCourseCategoryResponse } from "@/features/common/category/commands/create-category/create-category.response";
import { Cache } from "@nestjs/cache-manager";
import { COURSE_CATEGORIES_LIST_CACHE_KEY } from "@/features/common/category/category.cache";

@CommandHandler(CreateCourseCategoryCommand)
export class CreateCourseCategoryHandler implements ICommandHandler<CreateCourseCategoryCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateCourseCategoryCommand) {
    const titleExists = await CoursesCategory.existsBy({
      title: ILike(cmd.payload.title),
    });
    AlreadyExistException.ThrowIf(
      titleExists,
      "Category with this name already exists",
    );

    const category = CoursesCategory.create({ title: cmd.payload.title });
    const saved = await CoursesCategory.save(category);

    await this.cache.del(COURSE_CATEGORIES_LIST_CACHE_KEY);

    return plainToInstance(CreateCourseCategoryResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
