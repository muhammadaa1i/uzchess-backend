import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCategoryCommand } from "@/features/library/category/commands/delete-category/delete-category.command";
import { Category } from "../../../entities/category/category.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { ConflictException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { DeleteCategoryResponse } from "@/features/library/category/commands/delete-category/delete-category.response";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Cache } from "@nestjs/cache-manager";
import {
  CATEGORIES_LIST_CACHE_KEY,
  categoryByIdCacheKey,
} from "@/features/library/category/category.cache";

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: DeleteCategoryCommand) {
    const category = await Category.findOneBy({ id: cmd.id });

    DoesNotExistException.ThrowIfNull(category, "Category not found");

    const inUse = await Book.existsBy({ categoryId: cmd.id });
    if (inUse)
      throw new ConflictException(
        "Category is still in use by one or more books",
      );

    await Category.remove(category);

    await Promise.all([
      this.cache.del(CATEGORIES_LIST_CACHE_KEY),
      this.cache.del(categoryByIdCacheKey(cmd.id)),
    ]);

    return plainToInstance(DeleteCategoryResponse, {
      message: "Category deleted successfully",
    });
  }
}
