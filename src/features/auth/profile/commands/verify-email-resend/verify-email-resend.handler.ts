import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {randomInt} from "crypto";
import {VerifyEmailResendCommand} from "@/features/auth/profile/commands/verify-email-resend/verify-email-resend.command";
import {User} from "@/features/auth/entities/user/user.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {TooManyRequestsException} from "@/core/exceptions/too-many-requests.exception";
import {plainToInstance} from "class-transformer";
import {VerifyEmailResendResponse} from "@/features/auth/profile/commands/verify-email-resend/verify-email-resend.response";
import {Cache} from "@nestjs/cache-manager";
import {
    verifyEmailCacheKey,
    verifyEmailCooldownCacheKey,
    VERIFY_EMAIL_RECORD_TTL_MS,
} from "@/features/auth/profile/profile.cache";
import {sendVerificationCodeEmail} from "@/core/configs/mail/mail.service";

@CommandHandler(VerifyEmailResendCommand)
export class VerifyEmailResendHandler implements ICommandHandler<VerifyEmailResendCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute({userId}: VerifyEmailResendCommand) {
        const user = await User.findOneBy({id: userId});
        DoesNotExistException.ThrowIfNull(user, "User not found");

        AlreadyExistException.ThrowIf(
            user.isEmailVerified,
            "Email is already verified",
        );

        const onCooldown = await this.cache.get(
            verifyEmailCooldownCacheKey(userId),
        );
        TooManyRequestsException.ThrowIf(
            !!onCooldown,
            "Please wait before requesting a new code",
        );

        const code = randomInt(100000, 1000000).toString();

        await this.cache.set(
            verifyEmailCacheKey(userId),
            {code, createdAt: Date.now()},
            VERIFY_EMAIL_RECORD_TTL_MS,
        );
        await this.cache.set(verifyEmailCooldownCacheKey(userId), true, 1000 * 60);

        await sendVerificationCodeEmail(user.email!, code);

        return plainToInstance(
            VerifyEmailResendResponse,
            {
                message: "Confirmation code sent",
                email: user.email,
            },
            {excludeExtraneousValues: true},
        );
    }
}
