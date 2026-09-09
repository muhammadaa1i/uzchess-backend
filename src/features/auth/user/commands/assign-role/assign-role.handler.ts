import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AssignRoleCommand } from "@/features/auth/user/commands/assign-role/assign-role.command";
import { User } from "@/features/auth/entities/user/user.entity";
import { Role as RoleEntity } from "@/features/auth/entities/role/role.entity";
import { UserRole } from "@/features/auth/entities/user-role/user.role.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { plainToInstance } from "class-transformer";
import { AssignRoleResponse } from "@/features/auth/user/commands/assign-role/assign-role.response";

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  async execute({ userId, payload }: AssignRoleCommand) {
    const user = await User.findOne({
      where: { id: userId },
      relations: { userRoles: { role: true } },
    });
    DoesNotExistException.ThrowIfNull(user, "User not found");

    const role = await RoleEntity.findOneBy({ title: payload.role });
    DoesNotExistException.ThrowIfNull(role, "Role not found");

    const alreadyAssigned = user.userRoles.some((ur) => ur.roleId === role.id);
    AlreadyExistException.ThrowIf(alreadyAssigned, "User already has this role");

    await UserRole.save(UserRole.create({ userId: user.id, roleId: role.id }));

    return plainToInstance(
      AssignRoleResponse,
      {
        userId: user.id,
        roles: [...user.userRoles.map((ur) => ur.role.title), role.title],
      },
      { excludeExtraneousValues: true },
    );
  }
}
