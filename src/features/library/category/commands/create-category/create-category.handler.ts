import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCategoryCommand } from "@/features/library/category/commands/create-category/create-category.command";
import { Category } from "../../../entities/category/category.entity";
import { ConflictException } from "@nestjs/common";
import { ILike } from "typeorm";
import { plainToInstance } from "class-transformer";
import { CreateCategoryResponse } from "@/features/library/category/commands/create-category/create-category.response";
import { Cache } from "@nestjs/cache-manager";
import { CATEGORIES_LIST_CACHE_KEY } from "@/features/library/category/category.cache";

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
  constructor(private readonly cache: Cache) {}

  async execute(cmd: CreateCategoryCommand) {
    const category = await Category.findOne({
      where: { title: ILike(cmd.payload.title) },
    });

    if (category)
      throw new ConflictException("Category with this name already exist");

    const newCategory = Category.create({ title: cmd.payload.title });
    const saved = await Category.save(newCategory);

    await this.cache.del(CATEGORIES_LIST_CACHE_KEY);

    return plainToInstance(CreateCategoryResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
