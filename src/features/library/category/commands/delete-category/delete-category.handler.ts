import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {DeleteCategoryCommand} from '@/features/library/category/commands/delete-category/delete-category.command';
import {Category} from '../../../entities/category/category.entity';
import {plainToInstance} from 'class-transformer';
import {DeleteCategoryResponse} from '@/features/library/category/commands/delete-category/delete-category.response';
import {DoesNotExistException} from '@/core/exceptions/does-not-exist.exception';

@CommandHandler(DeleteCategoryCommand)
export class DeleteCategoryHandler implements ICommandHandler<DeleteCategoryCommand> {
    async execute(cmd: DeleteCategoryCommand) {
        const category = await Category.findOneBy({id: cmd.id});

        DoesNotExistException.ThrowIfNull(category, 'Category not found');

        await Category.remove(category);

        return plainToInstance(DeleteCategoryResponse, {
            message: 'Category deleted successfully',
        });
    }
}
