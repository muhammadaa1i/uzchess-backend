import {Module} from '@nestjs/common';
import {CreateAuthorHandler} from '@/features/library/author/commands/create-author/create-author.handler';
import {UpdateAuthorHandler} from '@/features/library/author/commands/update-author/update-author.handler';
import {DeleteAuthorHandler} from '@/features/library/author/commands/delete-author/delete-author.handler';
import {AuthorController} from '@/features/library/author/author.controller';
import {CqrsModule} from '@nestjs/cqrs';
import {GetAuthorsHandler} from '@/features/library/author/queries/get-authors/get-authors.handler';
import {GetAuthorsByIdHandler} from '@/features/library/author/queries/get-authors-by-id/get-authors-by-id.handler';

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
