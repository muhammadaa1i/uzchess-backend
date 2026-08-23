import { Role } from "@/core/enums/role/role.enum";

export type JwtUser = {
  id: number;
  roles: Role[];
  [key: string]: any;
};
