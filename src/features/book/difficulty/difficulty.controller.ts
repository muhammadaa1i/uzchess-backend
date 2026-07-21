import {BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {multerStorageOptions} from "@/core/configs/multer.config";
import {
    CreateDifficultyRequest
} from "@/features/book/difficulty/commands/create-difficulty/create-difficulty.request";
import {ApiConsumes, ApiOkResponse} from "@nestjs/swagger";
import {CommandBus} from "@nestjs/cqrs";
import {
    CreateDifficultyCommand
} from "@/features/book/difficulty/commands/create-difficulty/create-difficulty.command";
import {
    CreateDifficultyResponse
} from "@/features/book/difficulty/commands/create-difficulty/create-difficulty.response";

@Controller('difficulty')
export class DifficultyController {
    constructor(private readonly cmdBus: CommandBus) {
    }

    @Post('create')
    @ApiOkResponse({type: CreateDifficultyResponse})
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('icon', {
        storage: multerStorageOptions({
            destination: 'icons',
            extensions: ['jpg', 'png', 'jpeg', 'svg']
        }),
        limits: {
            fileSize: 1024 * 1024 * 2,
            files: 1
        }
    }))
    async create(
        @Body() payload: CreateDifficultyRequest,
        @UploadedFile() icon: Express.Multer.File
    ) {
        if (!icon)
            throw new BadRequestException()

        return await this.cmdBus.execute(new CreateDifficultyCommand(payload.degree, icon.path))
    }
}