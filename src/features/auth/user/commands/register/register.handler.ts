import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException } from "@nestjs/common";
import { RegisterCommand } from "@/features/auth/user/commands/register/register.command";
import { User } from "@/features/auth/entities/user/user.entity";
import { RefreshToken } from "@/features/auth/entities/refresh-token/refresh-token.entity";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { plainToInstance } from "class-transformer";
import { RegisterResponse } from "@/features/auth/user/commands/register/register.response";
import { Cache } from "@nestjs/cache-manager";
import {
  verifyEmailCacheKey,
  VERIFY_EMAIL_RECORD_TTL_MS,
} from "@/features/auth/profile/profile.cache";
import { sendVerificationCodeEmail } from "@/core/configs/mail/mail.service";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly cache: Cache,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ payload }: RegisterCommand) {
    const emailTaken = await User.existsBy({ email: payload.email });
    AlreadyExistException.ThrowIf(emailTaken);

    if (payload.password !== payload.confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    const newUser = User.create({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: payload.password,
      isEmailVerified: false,
    });
    newUser.password = await argon2.hash(newUser.password);

    const savedUser = await User.save(newUser);

    const jwtPayload = {
      id: savedUser.id,
      roles: [],
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    const rawRefreshToken = randomBytes(64).toString("hex");
    const tokenHash = createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const refreshToken = RefreshToken.create({
      userId: savedUser.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    await RefreshToken.save(refreshToken);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.cache.set(
      verifyEmailCacheKey(savedUser.id),
      { code, createdAt: Date.now() },
      VERIFY_EMAIL_RECORD_TTL_MS,
    );

    await sendVerificationCodeEmail(savedUser.email!, code);

    return plainToInstance(
      RegisterResponse,
      { ...savedUser, accessToken, refreshToken: rawRefreshToken },
      { excludeExtraneousValues: true },
    );
  }
}
