import {Role} from "@/core/enums/role.enum";

export type JwtUser = {
    id: number;
    role: Role;
    [key: string]: any;
};