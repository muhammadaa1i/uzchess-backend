import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ResendEmailCommand} from "@/features/auth/profile/commands/resend-email/resend-email.command";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {TooManyRequestsException} from "@/core/exceptions/too-many-requests.exception";
import {plainToInstance} from "class-transformer";
import {ResendEmailResponse} from "@/features/auth/profile/commands/resend-email/resend-email.response";
import {Cache} from "@nestjs/cache-manager";
import {
    changeEmailCacheKey,
    changeEmailCooldownCacheKey,
    CHANGE_EMAIL_RECORD_TTL_MS,
    PendingEmailChange,
} from "@/features/auth/profile/profile.cache";
import {sendVerificationCodeEmail} from "@/core/configs/mail/mail.service";

@CommandHandler(ResendEmailCommand)
export class ResendEmailHandler implements ICommandHandler<ResendEmailCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute({userId}: ResendEmailCommand) {
        const pending = await this.cache.get<PendingEmailChange>(
            changeEmailCacheKey(userId),
        );
        DoesNotExistException.ThrowIfNull(
            pending,
            "No pending email change request or the code has expired",
        );

        const onCooldown = await this.cache.get(
            changeEmailCooldownCacheKey(userId),
        );
        TooManyRequestsException.ThrowIf(
            !!onCooldown,
            "Please wait before requesting a new code",
        );

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await this.cache.set(
            changeEmailCacheKey(userId),
            {newEmail: pending.newEmail, code, createdAt: Date.now()},
            CHANGE_EMAIL_RECORD_TTL_MS,
        );
        await this.cache.set(changeEmailCooldownCacheKey(userId), true, 1000 * 60);

        await sendVerificationCodeEmail(pending.newEmail, code);

        return plainToInstance(
            ResendEmailResponse,
            {
                message: "Confirmation code sent",
                email: pending.newEmail,
            },
            {excludeExtraneousValues: true},
        );
    }
}
