import { AssignRoleHandler } from "@/features/auth/user/commands/assign-role/assign-role.handler";
import { AssignRoleCommand } from "@/features/auth/user/commands/assign-role/assign-role.command";
import { AssignRoleRequest } from "@/features/auth/user/commands/assign-role/assign-role.request";
import { User } from "@/features/auth/entities/user/user.entity";
import { Role as RoleEntity } from "@/features/auth/entities/role/role.entity";
import { UserRole } from "@/features/auth/entities/user-role/user.role.entity";
import { Role } from "@/core/enums/role/role.enum";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("AssignRoleHandler", () => {
  let handler: AssignRoleHandler;

  beforeEach(() => {
    handler = new AssignRoleHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("grants a new role to a user on the happy path", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({
      id: 5,
      userRoles: [{ roleId: 1, role: { title: Role.User } }],
    } as any);
    jest
      .spyOn(RoleEntity, "findOneBy")
      .mockResolvedValue({ id: 2, title: Role.Admin } as any);
    const createSpy = jest.spyOn(UserRole, "create").mockReturnValue({} as any);
    const saveSpy = jest.spyOn(UserRole, "save").mockResolvedValue({} as any);

    const result = await handler.execute(
      new AssignRoleCommand(5, { role: Role.Admin } as AssignRoleRequest),
    );

    expect(createSpy).toHaveBeenCalledWith({ userId: 5, roleId: 2 });
    expect(saveSpy).toHaveBeenCalled();
    expect(result).toEqual({ userId: 5, roles: [Role.User, Role.Admin] });
  });

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const roleSpy = jest.spyOn(RoleEntity, "findOneBy");

    await expect(
      handler.execute(
        new AssignRoleCommand(5, { role: Role.Admin } as AssignRoleRequest),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(roleSpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the role isn't seeded", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({ id: 5, userRoles: [] } as any);
    jest.spyOn(RoleEntity, "findOneBy").mockResolvedValue(null);
    const saveSpy = jest.spyOn(UserRole, "save");

    await expect(
      handler.execute(
        new AssignRoleCommand(5, { role: Role.Admin } as AssignRoleRequest),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws AlreadyExistException (409) when the user already has the role", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({
      id: 5,
      userRoles: [{ roleId: 2, role: { title: Role.Admin } }],
    } as any);
    jest
      .spyOn(RoleEntity, "findOneBy")
      .mockResolvedValue({ id: 2, title: Role.Admin } as any);
    const saveSpy = jest.spyOn(UserRole, "save");

    await expect(
      handler.execute(
        new AssignRoleCommand(5, { role: Role.Admin } as AssignRoleRequest),
      ),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });
});
