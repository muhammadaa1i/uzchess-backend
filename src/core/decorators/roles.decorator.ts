import { Role } from "@/core/enums/role/role.enum";
import { SetMetadata } from "@nestjs/common";

export const RolesKey = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(RolesKey, roles);
