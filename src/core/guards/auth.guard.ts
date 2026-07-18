import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Request} from "express";
import {JwtService} from "@nestjs/jwt";
import {Reflector} from "@nestjs/core";
import {IS_PUBLIC_KEY} from "@/core/decorators/public.decorator";
import {JwtUser} from "@/core/types/jwt-user";
import {PermissionKey} from "@/core/decorators/permission.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
    ) {
    }

    canActivate(context: ExecutionContext) {
        const req: Request = context.switchToHttp().getRequest()
        const permissions = this.reflector.get(PermissionKey, context.getHandler())

        if (!permissions)
            return true

        if (!req.headers.authorization)
            throw new UnauthorizedException()

        const [bearer, token] = req.headers.authorization.split(' ')
        if (bearer !== 'Bearer' || !token)
            throw new UnauthorizedException()

        try {
            req.user = this.jwtService.verify<JwtUser>(token)
            return true
        } catch {
            throw new UnauthorizedException()
        }
    }
}