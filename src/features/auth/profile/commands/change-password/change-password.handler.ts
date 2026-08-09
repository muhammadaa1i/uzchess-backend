import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {BadRequestException} from "@nestjs/common";
import {ChangePasswordCommand} from "@/features/auth/profile/commands/change-password/change-password.command";
import {User} from "@/features/auth/entities/user.entity";
import {DoesNotExistException} from "@/core/exceptions/does-not-exist.exception";
import argon2 from "argon2";
import {plainToInstance} from "class-transformer";
import {ChangePasswordResponse} from "@/features/auth/profile/commands/change-password/change-password.response";

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
    async execute({userId, payload}: ChangePasswordCommand) {
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

        if (payload.newPassword !== payload.confirmNewPassword) {
            throw new BadRequestException("Passwords do not match");
        }

        user.password = await argon2.hash(payload.newPassword);
        await user.save();

        return plainToInstance(
            ChangePasswordResponse,
            {message: "Password changed successfully"},
            {excludeExtraneousValues: true},
        );
    }
}
