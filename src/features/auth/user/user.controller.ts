import {Body, Controller, Post, Req} from "@nestjs/common";
import {Throttle} from "@nestjs/throttler";
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
import {LoginResponse} from "@/features/auth/user/commands/login/login.response";
import {RefreshTokenRequest} from "@/features/auth/user/commands/refresh-token/refresh-token.request";
import {RefreshTokenCommand} from "@/features/auth/user/commands/refresh-token/refresh-token.command";
import {RefreshTokenResponse} from "@/features/auth/user/commands/refresh-token/refresh-token.response";

@ApiTags("Auth")
@Controller("auth")
export class UserController {
    constructor(private readonly cmdBus: CommandBus) {
    }

    @Public()
    @Throttle({default: {limit: 5, ttl: 60_000}})
    @ApiOkResponse({type: RegisterResponse})
    @Post("register")
    async register(@Body() payload: RegisterRequest) {
        return await this.cmdBus.execute(new RegisterCommand(payload));
    }

    @Public()
    @Throttle({default: {limit: 5, ttl: 60_000}})
    @ApiOkResponse({type: LoginResponse})
    @Post("login")
    async login(@Body() payload: LoginRequest) {
        return await this.cmdBus.execute(new LoginCommand(payload));
    }

    @Public()
    @Throttle({default: {limit: 10, ttl: 60_000}})
    @ApiOkResponse({type: RefreshTokenResponse})
    @Post("refresh")
    async refresh(@Body() payload: RefreshTokenRequest) {
        return await this.cmdBus.execute(new RefreshTokenCommand(payload));
    }

    @ApiOkResponse({type: LogoutResponse})
    @Post("logout")
    async logout(@Req() req: Request) {
        return await this.cmdBus.execute(new LogoutCommand(req.user!.id));
    }
}
