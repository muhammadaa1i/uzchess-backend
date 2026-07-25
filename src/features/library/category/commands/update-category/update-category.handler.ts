import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {UpdateCategoryCommand} from '@/features/library/category/commands/update-category/update-category.command';
import {Category} from '../../../entities/category/category.entity';
import {plainToInstance} from 'class-transformer';
import {UpdateCategoryResponse} from '@/features/library/category/commands/update-category/update-category.response';
import {DoesNotExistException} from '@/core/exceptions/does-not-exist.exception';

@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler implements ICommandHandler<UpdateCategoryCommand> {
    async execute(cmd: UpdateCategoryCommand) {
        const category = await Category.findOneBy({id: cmd.id});

        DoesNotExistException.ThrowIfNull(category, 'Category not found');

        category.title = cmd.title;

        return plainToInstance(UpdateCategoryResponse, await category.save(), {
            excludeExtraneousValues: true,
        });
    }
}
