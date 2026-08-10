import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginCommand } from "@/features/auth/user/commands/login/login.command";
import { User } from "@/features/auth/entities/user.entity";
import { RefreshToken } from "@/features/auth/entities/refresh-token.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@/core/enums/role.enum";
import { plainToInstance } from "class-transformer";
import { LoginResponse } from "@/features/auth/user/commands/login/login.response";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(private jwtService: JwtService) {}

  async execute({ payload }: LoginCommand) {
    const user = await User.findOne({
      where: { email: payload.email },
      relations: { userRoles: { role: true } },
    });
    DoesNotExistException.ThrowIfNull(
      user,
      "Username or password is incorrect",
    );

    const passwordsMatch = await argon2.verify(user.password, payload.password);
    DoesNotExistException.ThrowIf(
      !passwordsMatch,
      "Username or password is incorrect",
    );

    const jwtPayload = {
      id: user.id,
      roles: user.userRoles.map((ur) => ur.role.title as Role),
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    const rawRefreshToken = randomBytes(64).toString("hex");
    const tokenHash = createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const refreshToken = RefreshToken.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    await RefreshToken.save(refreshToken);

    return plainToInstance(
      LoginResponse,
      { accessToken, refreshToken: rawRefreshToken },
      { excludeExtraneousValues: true },
    );
  }
}
