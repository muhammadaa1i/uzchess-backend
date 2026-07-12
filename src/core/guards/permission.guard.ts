// import {CanActivate, ExecutionContext} from "@nestjs/common";
// import {Reflector} from "@nestjs/core";
// import {PermissionKey} from "@/core/decorators/permission.decorator";
// import {Permission} from "@/features/auth/entities/permission.entity";
//
// export class PermissionGuard implements CanActivate {
//     constructor(
//         private readonly reflector: Reflector
//     ) {
//     }
//
//     async canActivate(context: ExecutionContext) {
//         const req = context.switchToHttp().getRequest()
//         const permissions = this.reflector.get(PermissionKey, context.getHandler)
//
//         if (!permissions)
//             return true
//
//         const [resource, action] = permissions.split(':')
//         const allowedPermissions = await Permission.findBy({userPermissios: {userId: req.user.id, isAllowed: true}})
//     }
// }