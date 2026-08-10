import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {VerifyEmailConfirmCommand} from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.command";
import {User} from "@/features/auth/entities/user.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {GoneException} from "@/core/exceptions/gone.exception";
import {plainToInstance} from "class-transformer";
import {VerifyEmailConfirmResponse} from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.response";
import {Cache} from "@nestjs/cache-manager";
import {
    verifyEmailCacheKey,
    verifyEmailCooldownCacheKey,
    isVerifyEmailCodeExpired,
    PendingEmailVerification,
} from "@/features/auth/profile/profile.cache";

@CommandHandler(VerifyEmailConfirmCommand)
export class VerifyEmailConfirmHandler implements ICommandHandler<VerifyEmailConfirmCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute({userId, payload}: VerifyEmailConfirmCommand) {
        const user = await User.findOneBy({id: userId});
        DoesNotExistException.ThrowIfNull(user, "User not found");

        AlreadyExistException.ThrowIf(
            user.isEmailVerified,
            "Email is already verified",
        );

        const pending = await this.cache.get<PendingEmailVerification>(
            verifyEmailCacheKey(userId),
        );
        DoesNotExistException.ThrowIfNull(
            pending,
            "No pending verification. Please request a new code.",
        );

        if (isVerifyEmailCodeExpired(pending)) {
            await this.cache.del(verifyEmailCacheKey(userId));
            throw new GoneException(
                "Confirmation code has expired. Please request a new code.",
            );
        }

        DoesNotExistException.ThrowIf(
            pending.code !== payload.code,
            "Invalid confirmation code",
        );

        user.isEmailVerified = true;
        await user.save();

        await Promise.all([
            this.cache.del(verifyEmailCacheKey(userId)),
            this.cache.del(verifyEmailCooldownCacheKey(userId)),
        ]);

        return plainToInstance(
            VerifyEmailConfirmResponse,
            {
                message: "Email verified successfully",
                email: user.email,
            },
            {excludeExtraneousValues: true},
        );
    }
}
