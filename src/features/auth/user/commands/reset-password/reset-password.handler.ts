import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException } from "@nestjs/common";
import { ResetPasswordCommand } from "@/features/auth/user/commands/reset-password/reset-password.command";
import { ResetPasswordResponse } from "@/features/auth/user/commands/reset-password/reset-password.response";
import { User } from "@/features/auth/entities/user/user.entity";
import { RefreshToken } from "@/features/auth/entities/refresh-token/refresh-token.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { GoneException } from "@/core/exceptions/gone.exception";
import argon2 from "argon2";
import { plainToInstance } from "class-transformer";
import { Cache } from "@nestjs/cache-manager";
import { IsNull } from "typeorm";
import {
  forgotPasswordCacheKey,
  forgotPasswordCooldownCacheKey,
  isForgotPasswordCodeExpired,
  PendingPasswordReset,
} from "@/features/auth/user/user.cache";

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(private readonly cache: Cache) {}

  async execute({ payload }: ResetPasswordCommand) {
    const user = await User.findOneBy({ email: payload.email });
    DoesNotExistException.ThrowIfNull(user, "User not found");

    const pending = await this.cache.get<PendingPasswordReset>(
      forgotPasswordCacheKey(user.id),
    );
    DoesNotExistException.ThrowIfNull(
      pending,
      "No pending reset. Please request a new code.",
    );

    if (isForgotPasswordCodeExpired(pending)) {
      await this.cache.del(forgotPasswordCacheKey(user.id));
      throw new GoneException(
        "Confirmation code has expired. Please request a new code.",
      );
    }

    DoesNotExistException.ThrowIf(
      pending.code !== payload.code,
      "Invalid confirmation code",
    );

    if (payload.newPassword !== payload.confirmNewPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    user.password = await argon2.hash(payload.newPassword);
    await user.save();

    await RefreshToken.update(
      { userId: user.id, revokedAt: IsNull() },
      { revokedAt: new Date().toISOString() },
    );

    await Promise.all([
      this.cache.del(forgotPasswordCacheKey(user.id)),
      this.cache.del(forgotPasswordCooldownCacheKey(user.id)),
    ]);

    return plainToInstance(
      ResetPasswordResponse,
      { message: "Password reset successfully" },
      { excludeExtraneousValues: true },
    );
  }
}
