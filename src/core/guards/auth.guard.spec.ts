import { UnauthorizedException, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@/core/guards/auth.guard";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let jwtService: { verify: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  const buildContext = (headers: Record<string, string | undefined>): {
    context: ExecutionContext;
    req: { headers: Record<string, string | undefined>; user?: any };
  } => {
    const req: { headers: Record<string, string | undefined>; user?: any } = { headers };
    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
    return { context, req };
  };

  beforeEach(() => {
    jwtService = { verify: jest.fn() };
    reflector = { getAllAndOverride: jest.fn() };
    guard = new AuthGuard(jwtService as any, reflector as any);
  });

  it("returns true without checking headers when the route is public", () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const { context, req } = buildContext({});

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.user).toBeUndefined();
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedException when there is no Authorization header", () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const { context } = buildContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException when the header is not a Bearer token (Basic scheme)", () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const { context } = buildContext({ authorization: "Basic xyz" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException when Bearer scheme has no token after it", () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const { context } = buildContext({ authorization: "Bearer" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("throws UnauthorizedException when jwtService.verify throws (invalid/expired token)", () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verify.mockImplementation(() => {
      throw new Error("invalid signature");
    });
    const { context } = buildContext({ authorization: "Bearer bad.token.here" });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it("sets req.user to the decoded payload and returns true for a valid token", () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const payload = { id: 1, roles: ["admin"] };
    jwtService.verify.mockReturnValue(payload);
    const { context, req } = buildContext({ authorization: "Bearer good.token.here" });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(req.user).toEqual(payload);
    expect(jwtService.verify).toHaveBeenCalledWith("good.token.here");
  });
});
