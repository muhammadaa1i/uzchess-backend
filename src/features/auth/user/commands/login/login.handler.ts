import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginCommand } from "@/features/auth/user/commands/login/login.command";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import argon2 from "argon2";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@/core/enums/role.enum";

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

    return { accessToken: accessToken };
  }
}
