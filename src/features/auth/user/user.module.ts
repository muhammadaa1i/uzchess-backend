import {Module} from "@nestjs/common";
import {CqrsModule} from "@nestjs/cqrs";
import {UserController} from "@/features/auth/user/user.controller";
import {UserRoleController} from "@/features/auth/user/user-role.controller";
import {RegisterHandler} from "@/features/auth/user/commands/register/register.handler";
import {LoginHandler} from "@/features/auth/user/commands/login/login.handler";
import {LogoutHandler} from "@/features/auth/user/commands/logout/logout.handler";
import {RefreshTokenHandler} from "@/features/auth/user/commands/refresh-token/refresh-token.handler";
import {AssignRoleHandler} from "@/features/auth/user/commands/assign-role/assign-role.handler";

@Module({
    imports: [CqrsModule],
    controllers: [UserController, UserRoleController],
    providers: [
        RegisterHandler,
        LoginHandler,
        LogoutHandler,
        RefreshTokenHandler,
        AssignRoleHandler,
    ],
})
export class UserModule {
}
