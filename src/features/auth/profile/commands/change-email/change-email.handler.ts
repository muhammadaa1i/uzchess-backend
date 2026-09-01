import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {randomInt} from "crypto";
import {ChangeEmailCommand} from "@/features/auth/profile/commands/change-email/change-email.command";
import {User} from "@/features/auth/entities/user/user.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import {AlreadyExistException} from "@/core/exceptions/already-exist.exception";
import {TooManyRequestsException} from "@/core/exceptions/too-many-requests.exception";
import argon2 from "argon2";
import {plainToInstance} from "class-transformer";
import {ChangeEmailResponse} from "@/features/auth/profile/commands/change-email/change-email.response";
import {Not} from "typeorm";
import {Cache} from "@nestjs/cache-manager";
import {
    changeEmailCacheKey,
    changeEmailCooldownCacheKey,
    CHANGE_EMAIL_RECORD_TTL_MS,
} from "@/features/auth/profile/profile.cache";
import {sendVerificationCodeEmail} from "@/core/configs/mail/mail.service";

@CommandHandler(ChangeEmailCommand)
export class ChangeEmailHandler implements ICommandHandler<ChangeEmailCommand> {
    constructor(private readonly cache: Cache) {
    }

    async execute({userId, payload}: ChangeEmailCommand) {
        const user = await User.findOneBy({id: userId});
        DoesNotExistException.ThrowIfNull(user, "User not found");

        const passwordsMatch = await argon2.verify(
            user.password,
            payload.currentPassword,
        );
        DoesNotExistException.ThrowIf(
            !passwordsMatch,
            "Username or password is incorrect",
        );

        const alreadyExist = await User.existsBy({
            id: Not(userId),
            email: payload.newEmail,
        });
        AlreadyExistException.ThrowIf(alreadyExist, "Email already in use");

        const onCooldown = await this.cache.get(
            changeEmailCooldownCacheKey(userId),
        );
        TooManyRequestsException.ThrowIf(
            !!onCooldown,
            "Please wait before requesting a new code",
        );

        const code = randomInt(100000, 1000000).toString();

        await this.cache.set(
            changeEmailCacheKey(userId),
            {newEmail: payload.newEmail, code, createdAt: Date.now()},
            CHANGE_EMAIL_RECORD_TTL_MS,
        );
        await this.cache.set(changeEmailCooldownCacheKey(userId), true, 1000 * 60);

        await sendVerificationCodeEmail(payload.newEmail, code);

        return plainToInstance(
            ChangeEmailResponse,
            {
                message: "Confirmation code sent",
                email: payload.newEmail,
            },
            {excludeExtraneousValues: true},
        );
    }
}
