import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCategoryCommand } from "@/features/library/category/commands/update-category/update-category.command";
import { Category } from "../../../entities/category/category.entity";
import { ILike, Not } from "typeorm";
import { plainToInstance } from "class-transformer";
import { UpdateCategoryResponse } from "@/features/library/category/commands/update-category/update-category.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import {
  CATEGORIES_LIST_CACHE_KEY,
  categoryByIdCacheKey,
} from "@/features/library/category/category.cache";

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: UpdateCategoryCommand) {
    const category = await Category.findOneBy({ id: cmd.id });

    DoesNotExistException.ThrowIfNull(category, "Category not found");

    const titleExists = await Category.existsBy({
      id: Not(cmd.id),
      title: ILike(cmd.payload.title),
    });
    AlreadyExistException.ThrowIf(
      titleExists,
      "Category with this name already exist",
    );

    category.title = cmd.payload.title;
    const saved = await category.save();

    await Promise.all([
      this.cache.del(CATEGORIES_LIST_CACHE_KEY),
      this.cache.del(categoryByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(UpdateCategoryResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
