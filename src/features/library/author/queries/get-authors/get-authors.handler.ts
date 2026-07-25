import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {GetAuthorsQuery} from '@/features/library/author/queries/get-authors/get-authors.query';
import {Author} from '../../../entities/author/author.entity';
import {FindOptionsWhere, ILike} from 'typeorm';
import {plainToInstance} from 'class-transformer';
import {GetAuthorsResponse} from '@/features/library/author/queries/get-authors/get-authors.response';

@QueryHandler(GetAuthorsQuery)
export class GetAuthorsHandler implements IQueryHandler<GetAuthorsQuery> {
    async execute(query: GetAuthorsQuery) {
        const where: FindOptionsWhere<Author> = {};
        if (query.search) where.fullName = ILike(`%${query.search}%`);

        const authors = await Author.find({where});
        return plainToInstance(GetAuthorsResponse, authors, {
            excludeExtraneousValues: true,
        });
    }
}