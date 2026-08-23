import { ExecutionContext } from "@nestjs/common";
import { RoleGuard } from "@/core/guards/role.guard";
import { Role } from "@/core/enums/role/role.enum";

describe("RoleGuard", () => {
  let guard: RoleGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (user?: { roles: Role[] }): ExecutionContext => {
    const req: any = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RoleGuard(reflector as any);
  });

  it("returns true immediately when the route is public, never reading roles metadata", () => {
    reflector.getAllAndOverride.mockReturnValueOnce(true);
    const context = buildContext();

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    // Only the isPublic lookup should have happened, not a second call for RolesKey.
    expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
  });

  it("returns true when there is no @Roles() metadata on the route (open route)", () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(undefined); // roles
    const context = buildContext({ roles: [Role.User] });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("returns false when roles metadata is present but req.user is falsy", () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce([Role.Admin]); // roles
    const context = buildContext(undefined);

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it("returns true when req.user.roles partially overlaps the required roles (OR logic)", () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce([Role.Admin, Role.SuperAdmin]); // roles
    const context = buildContext({ roles: [Role.User, Role.Admin] });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it("returns false when req.user.roles has zero overlap with the required roles", () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce([Role.Admin, Role.SuperAdmin]); // roles
    const context = buildContext({ roles: [Role.User] });

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
