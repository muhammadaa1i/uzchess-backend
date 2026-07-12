import {Module} from '@nestjs/common';
import {CreateAuthorHandler} from 'src/features/library/author/commands/create-author/create-author.handler';
import {UpdateAuthorHandler} from 'src/features/library/author/commands/update-author/update-author.handler';
import {DeleteAuthorHandler} from 'src/features/library/author/commands/delete-author/delete-author.handler';
import {AuthorController} from 'src/features/library/author/author.controller';
import {CqrsModule} from '@nestjs/cqrs';
import {GetAuthorsHandler} from 'src/features/library/author/queries/get-authors/get-authors.handler';
import {GetAuthorsByIdHandler} from 'src/features/library/author/queries/get-authors-by-id/get-authors-by-id.handler';

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
