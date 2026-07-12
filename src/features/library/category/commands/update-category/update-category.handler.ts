import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCategoryCommand } from '@/features/library/category/commands/update-category/update-category.command';
import { Category } from '@/features/library/entities/category.entity';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UpdateCategoryResponse } from '@/features/library/category/commands/update-category/update-category.response';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
  async execute(cmd: UpdateCategoryCommand) {
    const category = await Category.findOneBy({ id: cmd.id });

    if (!category) throw new NotFoundException('Category not found');

    category.title = cmd.title;

    return plainToInstance(UpdateCategoryResponse, await category.save(), {
      excludeExtraneousValues: true,
    });
  }
}
