import argon2 from "argon2";
import { LoginHandler } from "@/features/auth/user/commands/login/login.handler";
import { LoginCommand } from "@/features/auth/user/commands/login/login.command";
import { LoginRequest } from "@/features/auth/user/commands/login/login.request";
import { User } from "@/features/auth/entities/user/user.entity";
import { RefreshToken } from "@/features/auth/entities/refresh-token/refresh-token.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { Role } from "@/core/enums/role.enum";
import { createHash } from "crypto";

describe("LoginHandler", () => {
  let handler: LoginHandler;
  let jwtService: { sign: jest.Mock };

  const basePayload = (overrides: Partial<LoginRequest> = {}) =>
    ({
      email: "john@example.com",
      password: "password123",
      ...overrides,
    }) as LoginRequest;

  beforeEach(() => {
    jwtService = { sign: jest.fn().mockReturnValue("signed-access-token") };
    handler = new LoginHandler(jwtService as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user isn't found", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    const verifySpy = jest.spyOn(argon2, "verify");

    await expect(
      handler.execute(new LoginCommand(basePayload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    await expect(
      handler.execute(new LoginCommand(basePayload())),
    ).rejects.toThrow("Username or password is incorrect");
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it("throws DoesNotExistException (404) when the password is incorrect", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({
      id: 1,
      password: "hashed-password",
      userRoles: [],
    } as any);
    jest.spyOn(argon2, "verify").mockResolvedValue(false);
    const saveSpy = jest.spyOn(RefreshToken, "save");

    await expect(
      handler.execute(new LoginCommand(basePayload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    await expect(
      handler.execute(new LoginCommand(basePayload())),
    ).rejects.toThrow("Username or password is incorrect");
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("logs in successfully and issues tokens on the happy path", async () => {
    jest.spyOn(User, "findOne").mockResolvedValue({
      id: 1,
      password: "hashed-password",
      userRoles: [
        { role: { title: Role.Admin } },
        { role: { title: Role.User } },
      ],
    } as any);
    jest.spyOn(argon2, "verify").mockResolvedValue(true);
    jest.spyOn(RefreshToken, "create").mockImplementation((data: any) => data);
    let savedRefreshToken: any = null;
    jest.spyOn(RefreshToken, "save").mockImplementation(async (rt: any) => {
      savedRefreshToken = rt;
      return rt;
    });

    const result = await handler.execute(new LoginCommand(basePayload()));

    expect(jwtService.sign).toHaveBeenCalledWith({
      id: 1,
      roles: [Role.Admin, Role.User],
    });
    expect(savedRefreshToken).not.toBeNull();
    expect(savedRefreshToken.userId).toBe(1);

    const rawTokenHash = createHash("sha256")
      .update(result.refreshToken)
      .digest("hex");
    expect(savedRefreshToken.tokenHash).toBe(rawTokenHash);
    expect(result.refreshToken).not.toBe(savedRefreshToken.tokenHash);
    expect(result.accessToken).toBe("signed-access-token");
  });
});
