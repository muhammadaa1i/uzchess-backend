import {Module} from '@nestjs/common';
import {CreateAuthorHandler} from '@/features/book/author/commands/create-author/create-author.handler';
import {UpdateAuthorHandler} from '@/features/book/author/commands/update-author/update-author.handler';
import {DeleteAuthorHandler} from '@/features/book/author/commands/delete-author/delete-author.handler';
import {AuthorController} from '@/features/book/author/author.controller';
import {CqrsModule} from '@nestjs/cqrs';
import {GetAuthorsHandler} from '@/features/book/author/queries/get-authors/get-authors.handler';
import {GetAuthorsByIdHandler} from '@/features/book/author/queries/get-authors-by-id/get-authors-by-id.handler';

@Module({
    imports: [CqrsModule],
    controllers: [AuthorController],
    providers: [
        GetAuthorsHandler,
        GetAuthorsByIdHandler,
        CreateAuthorHandler,
        UpdateAuthorHandler,
        DeleteAuthorHandler,
    ],
})
export class AuthorModule {
}
