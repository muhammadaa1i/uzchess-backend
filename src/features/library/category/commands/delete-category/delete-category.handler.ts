import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCategoryCommand } from '@/features/library/category/commands/delete-category/delete-category.command';
import { Category } from '@/features/library/entities/category.entity';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DeleteCategoryResponse } from '@/features/library/category/commands/delete-category/delete-category.response';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
  async execute(cmd: DeleteCategoryCommand) {
    const category = await Category.findOneBy({ id: cmd.id });

    if (!category) throw new NotFoundException('Category not found');

    await Category.remove(category);

    return plainToInstance(DeleteCategoryResponse, {
      message: 'Category deleted successfully',
    });
  }
}
