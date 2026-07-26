import { Module } from "@nestjs/common";
import { RegisterHandler } from "src/features/auth/user/register/register.handler";
import { UserController } from "./user/user.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { LoginHandler } from "src/features/auth/user/login/login.handler";

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [RegisterHandler, LoginHandler],
})
export class AuthModule {}
