import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import {GetAuthorsByIdQuery} from '@/features/library/author/queries/get-authors-by-id/get-authors-by-id.query';
import {Author} from '../../../entities/author/author.entity';
import {plainToInstance} from 'class-transformer';
import {GetAuthorsByIdResponse} from '@/features/library/author/queries/get-authors-by-id/get-authors-by-id.response';
import {DoesNotExistException} from '@/core/exceptions/does-not-exist.exception';

@QueryHandler(GetAuthorsByIdQuery)
export class GetAuthorsByIdHandler implements IQueryHandler<GetAuthorsByIdQuery> {
    async execute(query: GetAuthorsByIdQuery) {
        const author = await Author.findOneBy({id: query.id});

        DoesNotExistException.ThrowIfNull(author, 'Author is not found');

        return plainToInstance(GetAuthorsByIdResponse, author, {
            excludeExtraneousValues: true,
        });
    }
}
