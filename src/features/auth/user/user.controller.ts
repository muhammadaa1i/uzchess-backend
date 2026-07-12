import {Body, Controller, Post} from "@nestjs/common";
import {RegisterRequest} from "@/features/auth/user/register/register.request";
import {CommandBus} from "@nestjs/cqrs";
import {ApiOkResponse} from "@nestjs/swagger";
import {RegisterResponse} from "@/features/auth/user/register/register.response";
import {LoginRequest} from "@/features/auth/user/login/login.request";
import {Public} from "@/core/decorators/public.decorator";

@Controller('auth')
export class UserController {
    constructor(private readonly cmdBus: CommandBus) {
    }

    @Public()
    @ApiOkResponse({type: RegisterResponse})
    @Post('register')
    async register(@Body() payload: RegisterRequest) {
        return await this.cmdBus.execute(payload.toCommand())
    }

    @Public()
    @Post('login')
    async login(@Body() payload: LoginRequest) {
        return await this.cmdBus.execute(payload.toCommand())
    }
}