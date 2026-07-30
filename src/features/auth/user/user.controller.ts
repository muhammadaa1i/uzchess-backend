import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import type {Request} from "express";
import {RegisterRequest} from "@/features/auth/user/commands/register/register.request";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {ApiConsumes, ApiOkResponse} from "@nestjs/swagger";
import {RegisterResponse} from "@/features/auth/user/commands/register/register.response";
import {LoginRequest} from "@/features/auth/user/commands/login/login.request";
import {Public} from "@/core/decorators/public.decorator";
import {FileInterceptor} from "@nestjs/platform-express";
import {multerStorageOptions} from "@/core/configs/multer.config";
import {FileCleanupInterceptor} from "@/core/interceptors/file-cleanup.interceptor";
import {GetProfileQuery} from "@/features/auth/user/queries/get-profile/get-profile.query";
import {GetProfileResponse} from "@/features/auth/user/queries/get-profile/get-profile.response";
import {UpdateProfileRequest} from "@/features/auth/user/commands/update-profile/update-profile.request";
import {UpdateProfileCommand} from "@/features/auth/user/commands/update-profile/update-profile.command";
import {UpdateProfileResponse} from "@/features/auth/user/commands/update-profile/update-profile.response";

@Controller("auth")
export class UserController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Public()
    @ApiOkResponse({type: RegisterResponse})
    @Post("register")
    async register(@Body() payload: RegisterRequest) {
        return await this.cmdBus.execute(payload.toCommand());
    }

    @Public()
    @Post("login")
    async login(@Body() payload: LoginRequest) {
        return await this.cmdBus.execute(payload.toCommand());
    }

    @Get("profile")
    @ApiOkResponse({type: GetProfileResponse})
    async getById(@Req() req: Request) {
        return await this.queryBus.execute(new GetProfileQuery(req.user!.id));
    }

    @Patch("profile")
    @ApiOkResponse({type: UpdateProfileResponse})
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(
        FileInterceptor("avatar", {
            storage: multerStorageOptions({
                destination: "avatars",
                extensions: ["jpg", "png", "jpeg", "svg"],
            }),
            limits: {
                fileSize: 1024 * 1024 * 5,
                files: 1,
            },
        }),
        FileCleanupInterceptor,
    )
    async update(
        @Body() payload: UpdateProfileRequest,
        @UploadedFile() avatar: Express.Multer.File,
        @Req() req: Request,
    ) {
        return await this.cmdBus.execute(
            new UpdateProfileCommand(req.user!.id, payload.fullName, avatar?.path),
        );
    }
}
