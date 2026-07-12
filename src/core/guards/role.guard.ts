import {ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Request} from "express";
import {RolesKey} from "@/core/decorators/roles.decorator";
import {Role} from "@/core/enums/role.enum";
import {IS_PUBLIC_KEY} from "@/core/decorators/public.decorator";

@Injectable()
export class RoleGuard {
    constructor(
        private reflector: Reflector
    ) {
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])

        if (isPublic)
            return true

        const req: Request = context.switchToHttp().getRequest()
        const roles: Role[] = this.reflector.getAllAndOverride(RolesKey, [context.getHandler(), context.getClass()])

        if (!roles)
            return true

        if (!req.user)
            return false

        return roles.includes(req.user.role)
    }
}