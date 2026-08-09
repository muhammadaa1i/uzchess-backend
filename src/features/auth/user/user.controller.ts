import {Body, Controller, Post, Req} from "@nestjs/common";
import type {Request} from "express";
import {RegisterRequest} from "@/features/auth/user/commands/register/register.request";
import {RegisterCommand} from "@/features/auth/user/commands/register/register.command";
import {CommandBus} from "@nestjs/cqrs";
import {ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {RegisterResponse} from "@/features/auth/user/commands/register/register.response";
import {LoginRequest} from "@/features/auth/user/commands/login/login.request";
import {LoginCommand} from "@/features/auth/user/commands/login/login.command";
import {Public} from "@/core/decorators/public.decorator";
import {LogoutCommand} from "@/features/auth/user/commands/logout/logout.command";
import {LogoutResponse} from "@/features/auth/user/commands/logout/logout.response";

@ApiTags("Auth")
@Controller("auth")
export class UserController {
    constructor(private readonly cmdBus: CommandBus) {
    }

    @Public()
    @ApiOkResponse({type: RegisterResponse})
    @Post("register")
    async register(@Body() payload: RegisterRequest) {
        return await this.cmdBus.execute(new RegisterCommand(payload));
    }

    @Public()
    @Post("login")
    async login(@Body() payload: LoginRequest) {
        return await this.cmdBus.execute(new LoginCommand(payload));
    }

    @ApiOkResponse({type: LogoutResponse})
    @Post("logout")
    async logout(@Req() req: Request) {
        return await this.cmdBus.execute(new LogoutCommand(req.user!.id));
    }
}
