import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {multerStorageOptions} from "@/core/configs/multer.config";
import {unlink} from "node:fs/promises";
import {ApiConsumes, ApiOkResponse} from "@nestjs/swagger";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {Roles} from "@/core/decorators/roles.decorator";
import {Role} from "@/core/enums/role.enum";
import {Public} from "@/core/decorators/public.decorator";
import {CreateBookRequest} from "@/features/library/book/commands/create-book/create-book.request";
import {CreateBookCommand} from "@/features/library/book/commands/create-book/create-book.command";
import {CreateBookResponse} from "@/features/library/book/commands/create-book/create-book.response";
import {UpdateBookRequest} from "@/features/library/book/commands/update-book/update-book.request";
import {UpdateBookCommand} from "@/features/library/book/commands/update-book/update-book.command";
import {UpdateBookResponse} from "@/features/library/book/commands/update-book/update-book.response";
import {DeleteBookCommand} from "@/features/library/book/commands/delete-book/delete-book.command";
import {DeleteBookResponse} from "@/features/library/book/commands/delete-book/delete-book.response";
import {GetBooksQuery} from "@/features/library/book/queries/get-books/get-books.query";
import {GetBooksRequest} from "@/features/library/book/queries/get-books/get-books.request";
import {GetBooksResponse} from "@/features/library/book/queries/get-books/get-books.response";
import {GetBooksByIdQuery} from "@/features/library/book/queries/get-books-by-id/get-books-by-id.query";
import {GetBooksByIdResponse} from "@/features/library/book/queries/get-books-by-id/get-books-by-id.response";

function parseAuthorIds(authorIds: string): number[] {
    const ids = authorIds.split(',').map((id) => parseInt(id.trim(), 10))

    if (ids.some(isNaN))
        throw new BadRequestException('authorIds must be a comma-separated list of numbers')

    return ids
}

@Roles(Role.Admin)
@Controller('books')
export class BookController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {
    }

    @Public()
    @Get('read')
    @ApiOkResponse({type: [GetBooksResponse]})
    async getAll(@Query() payload: GetBooksRequest) {
        return await this.queryBus.execute(new GetBooksQuery(
            payload.search,
            payload.categoryId,
            payload.difficultyId,
            payload.languageId,
            payload.minRating,
        ))
    }

    @Public()
    @Get('read/:id')
    @ApiOkResponse({type: GetBooksByIdResponse})
    async getById(@Param('id', ParseIntPipe) id: number) {
        return await this.queryBus.execute(new GetBooksByIdQuery(id))
    }

    @Post('create')
    @ApiOkResponse({type: CreateBookResponse})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('cover', {
        storage: multerStorageOptions({
            destination: 'covers',
            extensions: ['jpg', 'png', 'jpeg', 'svg']
        }),
        limits: {
            fileSize: 1024 * 1024 * 2,
            files: 1
        }
    }))
    async create(
        @Body()
        payload: CreateBookRequest,
        @UploadedFile()
        cover: Express.Multer.File
    ) {
        if (!cover)
            throw new BadRequestException()

        try {
            return await this.cmdBus.execute(new CreateBookCommand(
                payload.title,
                payload.price,
                payload.discountPrice,
                payload.categoryId,
                payload.difficultyId,
                payload.languageId,
                parseAuthorIds(payload.authorIds),
                cover.path,
            ))
        } catch (error) {
            await unlink(cover.path).catch(() => {
            })
            throw error
        }
    }

    @Patch('update/:id')
    @ApiOkResponse({type: UpdateBookResponse})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('cover', {
        storage: multerStorageOptions({
            destination: 'covers',
            extensions: ['jpg', 'png', 'jpeg', 'svg']
        }),
        limits: {
            fileSize: 1024 * 1024 * 2,
            files: 1
        }
    }))
    async update(
        @Param('id', ParseIntPipe)
        id: number,
        @Body()
        payload: UpdateBookRequest,
        @UploadedFile()
        cover: Express.Multer.File
    ) {
        try {
            return await this.cmdBus.execute(new UpdateBookCommand(
                id,
                payload.title,
                payload.price,
                payload.discountPrice,
                payload.categoryId,
                payload.difficultyId,
                payload.languageId,
                payload.authorIds ? parseAuthorIds(payload.authorIds) : undefined,
                cover?.path,
            ))
        } catch (error) {
            if (cover) await unlink(cover.path).catch(() => {
            })
            throw error
        }
    }

    @Delete('delete/:id')
    @ApiOkResponse({type: DeleteBookResponse})
    async delete(@Param('id', ParseIntPipe) id: number) {
        return await this.cmdBus.execute(new DeleteBookCommand(id))
    }
}
