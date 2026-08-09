import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UserController } from "@/features/auth/user/user.controller";
import { RegisterHandler } from "@/features/auth/user/commands/register/register.handler";
import { LoginHandler } from "@/features/auth/user/commands/login/login.handler";
import { LogoutHandler } from "@/features/auth/user/commands/logout/logout.handler";

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [RegisterHandler, LoginHandler, LogoutHandler],
})
export class UserModule {}
