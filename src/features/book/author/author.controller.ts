import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post,} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {CreateAuthorRequest} from './commands/create-author/create-author.request';
import {UpdateAuthorRequest} from './commands/update-author/update-author.request';
import {DeleteAuthorCommand} from '@/features/book/author/commands/delete-author/delete-author.command';
import {GetAuthorsQuery} from '@/features/book/author/queries/get-authors/get-authors.query';
import {GetAuthorsByIdQuery} from '@/features/book/author/queries/get-authors-by-id/get-authors-by-id.query';
import {ApiOkResponse} from '@nestjs/swagger';
import {CreateAuthorResponse} from '@/features/book/author/commands/create-author/create-author.response';
import {UpdateAuthorResponse} from '@/features/book/author/commands/update-author/update-author.response';
import {DeleteAuthorResponse} from '@/features/book/author/commands/delete-author/delete-author.response';
import {GetAuthorsResponse} from '@/features/book/author/queries/get-authors/get-authors.response';
import {GetAuthorsByIdResponse} from '@/features/book/author/queries/get-authors-by-id/get-authors-by-id.response';
import {Public} from "@/core/decorators/public.decorator";
import {Role} from "@/core/enums/role.enum";
import {Roles} from "@/core/decorators/roles.decorator";

@Roles(Role.Admin)
@Controller('authors')
export class AuthorController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Public()
    @Get('read')
    @ApiOkResponse({type: GetAuthorsResponse})
    async getAll() {
        return await this.queryBus.execute(new GetAuthorsQuery());
    }

    @Public()
    @Get('read/:id')
    @ApiOkResponse({type: GetAuthorsByIdResponse})
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.queryBus.execute(new GetAuthorsByIdQuery(id));
    }

    @Post('create')
    @ApiOkResponse({type: CreateAuthorResponse})
    async create(@Body() payload: CreateAuthorRequest) {
        return await this.cmdBus.execute(payload.toCommand());
    }

    @Patch('update/:id')
    @ApiOkResponse({type: UpdateAuthorResponse})
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateAuthorRequest,
    ) {
        return this.cmdBus.execute(payload.toCommand(id));
    }

    @Delete('delete/:id')
    @ApiOkResponse({type: DeleteAuthorResponse})
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.cmdBus.execute(new DeleteAuthorCommand(id));
    }
}
