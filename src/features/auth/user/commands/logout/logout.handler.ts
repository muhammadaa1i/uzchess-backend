import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LogoutCommand } from "@/features/auth/user/commands/logout/logout.command";
import { LogoutResponse } from "@/features/auth/user/commands/logout/logout.response";
import { plainToInstance } from "class-transformer";
import { IsNull } from "typeorm";
import { RefreshToken } from "@/features/auth/entities/refresh-token.entity";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  async execute({ userId }: LogoutCommand) {
    await RefreshToken.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date().toISOString() },
    );

    return plainToInstance(
      LogoutResponse,
      { message: "Logged out successfully" },
      { excludeExtraneousValues: true },
    );
  }
}
