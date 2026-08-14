import { ExecutionContext } from "@nestjs/common";
import { PermissionGuard } from "@/core/guards/permission.guard";
import { Permission } from "@/features/auth/entities/permission/permission.entity";

describe("PermissionGuard", () => {
  let guard: PermissionGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let cache: { get: jest.Mock; set: jest.Mock };

  const buildContext = (userId = 1, user: any = { id: userId }): ExecutionContext => {
    const req: any = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  const perm = (id: number, resource: string, action: string): Permission =>
    ({ id, resource, action }) as Permission;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    cache = { get: jest.fn(), set: jest.fn() };
    guard = new PermissionGuard(reflector as any, cache as any);
    jest.restoreAllMocks();
  });

  it("returns true immediately when there is no @PermissionDecorator() metadata, no cache/DB calls at all", async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const cacheGetSpy = jest.spyOn(cache, "get");
    const findBySpy = jest.spyOn(Permission, "findBy");
    const context = buildContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(cacheGetSpy).not.toHaveBeenCalled();
    expect(findBySpy).not.toHaveBeenCalled();
  });

  it("honors @PermissionDecorator() applied at the controller-class level, not just the handler", async () => {
    // getAllAndOverride checks [handler, class] in order — assert the guard actually
    // passes both context accessors through, so class-level metadata isn't silently ignored.
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    cache.get.mockResolvedValue([perm(1, "books", "delete")]);
    const context = buildContext(7);

    await guard.canActivate(context);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      expect.anything(),
      [context.getHandler(), context.getClass()],
    );
  });

  it("returns false (not a crash) when @PermissionDecorator() metadata exists but req.user is missing", async () => {
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    const cacheGetSpy = jest.spyOn(cache, "get");
    const findBySpy = jest.spyOn(Permission, "findBy");
    const context = buildContext(1, null);

    const result = await guard.canActivate(context);

    expect(result).toBe(false);
    expect(cacheGetSpy).not.toHaveBeenCalled();
    expect(findBySpy).not.toHaveBeenCalled();
  });

  it("cache hit: uses the cached permission list directly and never calls Permission.findBy", async () => {
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    const cachedPermissions = [perm(1, "books", "delete")];
    cache.get.mockResolvedValue(cachedPermissions);
    const findBySpy = jest.spyOn(Permission, "findBy");
    const context = buildContext(42);

    const result = await guard.canActivate(context);

    expect(cache.get).toHaveBeenCalledWith("permission:42");
    expect(findBySpy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it("cache miss, has matching permission: merges allowed-direct + role-derived, writes to cache, returns true", async () => {
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    cache.get.mockResolvedValue(undefined);

    const allowedDirect = [perm(1, "books", "delete")];
    const deniedDirect: Permission[] = [];
    const roleDerived = [perm(2, "courses", "create")];

    const findBySpy = jest
      .spyOn(Permission, "findBy")
      .mockResolvedValueOnce(allowedDirect as any)
      .mockResolvedValueOnce(deniedDirect as any)
      .mockResolvedValueOnce(roleDerived as any);

    const context = buildContext(7);

    const result = await guard.canActivate(context);

    expect(findBySpy).toHaveBeenCalledTimes(3);
    expect(cache.set).toHaveBeenCalledWith(
      "permission:7",
      expect.arrayContaining([...allowedDirect, ...roleDerived]),
    );
    expect(result).toBe(true);
  });

  it("cache miss, no matching permission: returns false", async () => {
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    cache.get.mockResolvedValue(undefined);

    jest
      .spyOn(Permission, "findBy")
      .mockResolvedValueOnce([perm(1, "courses", "create")] as any) // allowed-direct
      .mockResolvedValueOnce([] as any) // denied-direct
      .mockResolvedValueOnce([perm(2, "courses", "update")] as any); // role-derived

    const context = buildContext(7);

    const result = await guard.canActivate(context);

    expect(result).toBe(false);
  });

  it("deny beats allow: a role-derived permission that is also explicitly denied is excluded from the merge", async () => {
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    cache.get.mockResolvedValue(undefined);

    // Same permission (id: 5, books:delete) is both role-derived AND explicitly denied.
    const deniedPermission = perm(5, "books", "delete");
    const allowedDirect: Permission[] = [];
    const deniedDirect = [deniedPermission];
    const roleDerived = [deniedPermission];

    jest
      .spyOn(Permission, "findBy")
      .mockResolvedValueOnce(allowedDirect as any)
      .mockResolvedValueOnce(deniedDirect as any)
      .mockResolvedValueOnce(roleDerived as any);

    const context = buildContext(7);

    const result = await guard.canActivate(context);

    // The deny must win: role-granted "books:delete" should NOT survive the merge.
    expect(result).toBe(false);
    expect(cache.set).toHaveBeenCalledWith("permission:7", []);
  });

  it("deny beats allow: a permission that is both directly allowed AND directly denied is excluded from the merge", async () => {
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    cache.get.mockResolvedValue(undefined);

    // Same permission (id: 9, books:delete) is both directly allowed AND directly denied.
    const conflictedPermission = perm(9, "books", "delete");
    const allowedDirect = [conflictedPermission];
    const deniedDirect = [conflictedPermission];
    const roleDerived: Permission[] = [];

    jest
      .spyOn(Permission, "findBy")
      .mockResolvedValueOnce(allowedDirect as any)
      .mockResolvedValueOnce(deniedDirect as any)
      .mockResolvedValueOnce(roleDerived as any);

    const context = buildContext(7);

    const result = await guard.canActivate(context);

    // The deny must win over the direct allow for the same permission id.
    expect(result).toBe(false);
    expect(cache.set).toHaveBeenCalledWith("permission:7", []);
  });

  it("splits the 'resource:action' permission string correctly (books:delete matches resource=books, action=delete)", async () => {
    reflector.getAllAndOverride.mockReturnValue("books:delete");
    cache.get.mockResolvedValue(undefined);

    jest
      .spyOn(Permission, "findBy")
      .mockResolvedValueOnce([] as any) // allowed-direct
      .mockResolvedValueOnce([] as any) // denied-direct
      .mockResolvedValueOnce([perm(1, "books", "delete")] as any); // role-derived

    const context = buildContext(7);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });
});
