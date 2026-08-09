import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LogoutCommand } from "@/features/auth/user/commands/logout/logout.command";
import { LogoutResponse } from "@/features/auth/user/commands/logout/logout.response";
import { plainToInstance } from "class-transformer";
import { Cache } from "@nestjs/cache-manager";
import {
  logoutCacheKey,
  LOGOUT_MARKER_TTL_MS,
} from "@/features/auth/user/user.cache";

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly cache: Cache) {}

  async execute({ userId }: LogoutCommand) {
    await this.cache.set(
      logoutCacheKey(userId),
      Date.now(),
      LOGOUT_MARKER_TTL_MS,
    );

    return plainToInstance(
      LogoutResponse,
      { message: "Logged out successfully" },
      { excludeExtraneousValues: true },
    );
  }
}
