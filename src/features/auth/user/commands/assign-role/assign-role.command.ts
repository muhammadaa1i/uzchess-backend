import { AssignRoleRequest } from "@/features/auth/user/commands/assign-role/assign-role.request";

export class AssignRoleCommand {
  constructor(
    public readonly userId: number,
    public readonly payload: AssignRoleRequest,
  ) {}
}
