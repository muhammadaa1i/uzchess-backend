import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ConfirmEmailCommand} from "@/features/auth/profile/commands/confirm-email/confirm-email.command";
import {User} from "@/features/auth/entities/user.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {GoneException} from "@/core/exceptions/gone.exception";
import {plainToInstance} from "class-transformer";
import {ConfirmEmailResponse} from "@/features/auth/profile/commands/confirm-email/confirm-email.response";
import {Cache} from "@nestjs/cache-manager";
import {
    changeEmailCacheKey,
    changeEmailCooldownCacheKey,
    isChangeEmailCodeExpired,
    PendingEmailChange,
} from "@/features/auth/profile/profile.cache";

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailHandler implements ICommandHandler<ConfirmEmailCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute({userId, payload}: ConfirmEmailCommand) {
        const user = await User.findOneBy({id: userId});
        DoesNotExistException.ThrowIfNull(user, "User not found");

        const pending = await this.cache.get<PendingEmailChange>(
            changeEmailCacheKey(userId),
        );
        DoesNotExistException.ThrowIfNull(
            pending,
            "No pending email change request. Please start the email change process again.",
        );

        if (isChangeEmailCodeExpired(pending)) {
            await this.cache.del(changeEmailCacheKey(userId));
            throw new GoneException(
                "Confirmation code has expired. Please request a new code.",
            );
        }

        DoesNotExistException.ThrowIf(
            pending.code !== payload.code,
            "Invalid confirmation code",
        );

        user.email = pending.newEmail;
        await user.save();

        await Promise.all([
            this.cache.del(changeEmailCacheKey(userId)),
            this.cache.del(changeEmailCooldownCacheKey(userId)),
        ]);

        return plainToInstance(
            ConfirmEmailResponse,
            {
                message: "Email changed successfully",
                email: user.email,
            },
            {excludeExtraneousValues: true},
        );
    }
}
