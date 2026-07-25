import {CommandHandler, ICommandHandler} from '@nestjs/cqrs';
import {CreateCategoryCommand} from '@/features/library/category/commands/create-category/create-category.command';
import {Category} from '../../../entities/category/category.entity';
import {ConflictException} from '@nestjs/common';
import {ILike} from 'typeorm';
import {plainToInstance} from 'class-transformer';
import {CreateCategoryResponse} from '@/features/library/category/commands/create-category/create-category.response';

@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler implements ICommandHandler<CreateCategoryCommand> {
    async execute(cmd: CreateCategoryCommand) {
        const category = await Category.findOne({
            where: {title: ILike(cmd.title)},
        });

        if (category)
            throw new ConflictException('Category with this name already exist');

        const newCategory = Category.create({title: cmd.title});
        return plainToInstance(CreateCategoryResponse, await Category.save(newCategory), {
            excludeExtraneousValues: true,
        });
    }
}
