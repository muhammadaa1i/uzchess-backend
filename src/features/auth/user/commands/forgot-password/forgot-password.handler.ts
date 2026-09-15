import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { randomInt } from "crypto";
import { ForgotPasswordCommand } from "@/features/auth/user/commands/forgot-password/forgot-password.command";
import { ForgotPasswordResponse } from "@/features/auth/user/commands/forgot-password/forgot-password.response";
import { User } from "@/features/auth/entities/user/user.entity";
import { TooManyRequestsException } from "@/core/exceptions/too-many-requests.exception";
import { plainToInstance } from "class-transformer";
import { Cache } from "@nestjs/cache-manager";
import {
  forgotPasswordCacheKey,
  forgotPasswordCooldownCacheKey,
  FORGOT_PASSWORD_RECORD_TTL_MS,
} from "@/features/auth/user/user.cache";
import { sendVerificationCodeEmail } from "@/core/configs/mail/mail.service";

const GENERIC_MESSAGE =
  "If an account exists for this email, a reset code has been sent";

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(private readonly cache: Cache) {}

  async execute({ payload }: ForgotPasswordCommand) {
    const user = await User.findOneBy({ email: payload.email });

    if (user) {
      const onCooldown = await this.cache.get(
        forgotPasswordCooldownCacheKey(user.id),
      );
      TooManyRequestsException.ThrowIf(
        !!onCooldown,
        "Please wait before requesting a new code",
      );

      const code = randomInt(100000, 1000000).toString();

      await this.cache.set(
        forgotPasswordCacheKey(user.id),
        { code, createdAt: Date.now() },
        FORGOT_PASSWORD_RECORD_TTL_MS,
      );
      await this.cache.set(
        forgotPasswordCooldownCacheKey(user.id),
        true,
        1000 * 60,
      );

      sendVerificationCodeEmail(user.email!, code).catch((error) => {
        Logger.error(
          `Failed to send password reset email to ${user.email}: ${error}`,
          undefined,
          "ForgotPasswordHandler",
        );
      });
    }

    return plainToInstance(
      ForgotPasswordResponse,
      { message: GENERIC_MESSAGE },
      { excludeExtraneousValues: true },
    );
  }
}
