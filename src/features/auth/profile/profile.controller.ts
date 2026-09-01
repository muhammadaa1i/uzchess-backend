import {Body, Controller, Get, Patch, Post, Req, UploadedFile, UseInterceptors} from "@nestjs/common";
import {Throttle} from "@nestjs/throttler";
import type {Request} from "express";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {ApiConsumes, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {FileInterceptor} from "@nestjs/platform-express";
import {multerStorageOptions} from "@/core/configs/multer/multer.config";
import {FileCleanupInterceptor} from "@/core/interceptors/file-cleanup.interceptor";
import {GetProfileQuery} from "@/features/auth/profile/queries/get-profile/get-profile.query";
import {GetProfileResponse} from "@/features/auth/profile/queries/get-profile/get-profile.response";
import {UpdateProfileRequest} from "@/features/auth/profile/commands/update-profile/update-profile.request";
import {UpdateProfileCommand} from "@/features/auth/profile/commands/update-profile/update-profile.command";
import {UpdateProfileResponse} from "@/features/auth/profile/commands/update-profile/update-profile.response";
import {ChangePasswordRequest} from "@/features/auth/profile/commands/change-password/change-password.request";
import {ChangePasswordCommand} from "@/features/auth/profile/commands/change-password/change-password.command";
import {ChangePasswordResponse} from "@/features/auth/profile/commands/change-password/change-password.response";
import {ChangeEmailRequest} from "@/features/auth/profile/commands/change-email/change-email.request";
import {ChangeEmailCommand} from "@/features/auth/profile/commands/change-email/change-email.command";
import {ChangeEmailResponse} from "@/features/auth/profile/commands/change-email/change-email.response";
import {ResendEmailCommand} from "@/features/auth/profile/commands/resend-email/resend-email.command";
import {ResendEmailResponse} from "@/features/auth/profile/commands/resend-email/resend-email.response";
import {ConfirmEmailRequest} from "@/features/auth/profile/commands/confirm-email/confirm-email.request";
import {ConfirmEmailCommand} from "@/features/auth/profile/commands/confirm-email/confirm-email.command";
import {ConfirmEmailResponse} from "@/features/auth/profile/commands/confirm-email/confirm-email.response";
import {VerifyEmailResendCommand} from "@/features/auth/profile/commands/verify-email-resend/verify-email-resend.command";
import {VerifyEmailResendResponse} from "@/features/auth/profile/commands/verify-email-resend/verify-email-resend.response";
import {VerifyEmailConfirmRequest} from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.request";
import {VerifyEmailConfirmCommand} from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.command";
import {VerifyEmailConfirmResponse} from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.response";

@ApiTags("Profile")
@Controller("profile")
export class ProfileController {
    constructor(
        private readonly cmdBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {
    }

    @Get()
    @ApiOkResponse({type: GetProfileResponse})
    async getById(@Req() req: Request) {
        return await this.queryBus.execute(new GetProfileQuery(req.user!.id));
    }

    @Patch()
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
            new UpdateProfileCommand(req.user!.id, payload, avatar?.path),
        );
    }

    @Patch("password")
    @ApiOkResponse({type: ChangePasswordResponse})
    async changePassword(
        @Body() payload: ChangePasswordRequest,
        @Req() req: Request,
    ) {
        return await this.cmdBus.execute(
            new ChangePasswordCommand(req.user!.id, payload),
        );
    }

    @Patch("email")
    @ApiOkResponse({type: ChangeEmailResponse})
    async changeEmail(@Body() payload: ChangeEmailRequest, @Req() req: Request) {
        return await this.cmdBus.execute(
            new ChangeEmailCommand(req.user!.id, payload),
        );
    }

    @Post("email/resend")
    @ApiOkResponse({type: ResendEmailResponse})
    async resendEmail(@Req() req: Request) {
        return await this.cmdBus.execute(new ResendEmailCommand(req.user!.id));
    }

    @Post("email/confirm")
    @Throttle({default: {limit: 5, ttl: 60_000}})
    @ApiOkResponse({type: ConfirmEmailResponse})
    async confirmEmail(
        @Body() payload: ConfirmEmailRequest,
        @Req() req: Request,
    ) {
        return await this.cmdBus.execute(
            new ConfirmEmailCommand(req.user!.id, payload),
        );
    }

    @Post("verify-email/resend")
    @ApiOkResponse({type: VerifyEmailResendResponse})
    async resendVerifyEmail(@Req() req: Request) {
        return await this.cmdBus.execute(
            new VerifyEmailResendCommand(req.user!.id),
        );
    }

    @Post("verify-email/confirm")
    @Throttle({default: {limit: 5, ttl: 60_000}})
    @ApiOkResponse({type: VerifyEmailConfirmResponse})
    async confirmVerifyEmail(
        @Body() payload: VerifyEmailConfirmRequest,
        @Req() req: Request,
    ) {
        return await this.cmdBus.execute(
            new VerifyEmailConfirmCommand(req.user!.id, payload),
        );
    }
}
