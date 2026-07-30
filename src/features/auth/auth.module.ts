import { Module } from "@nestjs/common";
import { RegisterHandler } from "src/features/auth/user/commands/register/register.handler";
import { UserController } from "./user/user.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { LoginHandler } from "src/features/auth/user/commands/login/login.handler";
import { GetProfileHandler } from "@/features/auth/user/queries/get-profile/get-profile.handler";
import { UpdateProfileHandler } from "@/features/auth/user/commands/update-profile/update-profile.handler";

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [
    RegisterHandler,
    LoginHandler,
    GetProfileHandler,
    UpdateProfileHandler,
  ],
})
export class AuthModule {}
