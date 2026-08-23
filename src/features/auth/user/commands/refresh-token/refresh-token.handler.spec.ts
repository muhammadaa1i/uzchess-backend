import { UnauthorizedException } from "@nestjs/common";
import { createHash } from "crypto";
import { RefreshTokenHandler } from "@/features/auth/user/commands/refresh-token/refresh-token.handler";
import { RefreshTokenCommand } from "@/features/auth/user/commands/refresh-token/refresh-token.command";
import { RefreshTokenRequest } from "@/features/auth/user/commands/refresh-token/refresh-token.request";
import { RefreshToken } from "@/features/auth/entities/refresh-token/refresh-token.entity";
import { Role } from "@/core/enums/role/role.enum";

describe("RefreshTokenHandler", () => {
  let handler: RefreshTokenHandler;
  let jwtService: { sign: jest.Mock };

  const basePayload = (overrides: Partial<RefreshTokenRequest> = {}) =>
    ({
      refreshToken: "raw-refresh-token",
      ...overrides,
    }) as RefreshTokenRequest;

  beforeEach(() => {
    jwtService = { sign: jest.fn().mockReturnValue("signed-access-token") };
    handler = new RefreshTokenHandler(jwtService as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws UnauthorizedException when the token hash isn't found", async () => {
    jest.spyOn(RefreshToken, "findOne").mockResolvedValue(null);
    const saveSpy = jest.spyOn(RefreshToken, "save");

    await expect(
      handler.execute(new RefreshTokenCommand(basePayload())),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedException when the token is revoked", async () => {
    jest.spyOn(RefreshToken, "findOne").mockResolvedValue({
      id: 1,
      userId: 1,
      revokedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60).toISOString(),
      user: { id: 1, userRoles: [] },
    } as any);
    const saveSpy = jest.spyOn(RefreshToken, "save");

    await expect(
      handler.execute(new RefreshTokenCommand(basePayload())),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws UnauthorizedException when the token is expired", async () => {
    jest.spyOn(RefreshToken, "findOne").mockResolvedValue({
      id: 1,
      userId: 1,
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000 * 60).toISOString(),
      user: { id: 1, userRoles: [] },
    } as any);
    const saveSpy = jest.spyOn(RefreshToken, "save");

    await expect(
      handler.execute(new RefreshTokenCommand(basePayload())),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("revokes the old token and issues a new one on the happy path", async () => {
    const oldToken: any = {
      id: 1,
      userId: 42,
      tokenHash: "old-hash",
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      user: {
        id: 42,
        userRoles: [{ role: { title: Role.User } }],
      },
    };
    jest.spyOn(RefreshToken, "findOne").mockResolvedValue(oldToken);

    const savedTokens: any[] = [];
    jest.spyOn(RefreshToken, "save").mockImplementation(async (rt: any) => {
      savedTokens.push({ ...rt });
      return rt;
    });
    jest.spyOn(RefreshToken, "create").mockImplementation((data: any) => data);

    const result = await handler.execute(new RefreshTokenCommand(basePayload()));

    // First save call: revocation of the old token.
    expect(oldToken.revokedAt).not.toBeNull();
    expect(savedTokens[0]).toEqual(
      expect.objectContaining({ id: 1, revokedAt: expect.any(String) }),
    );

    // Second save call: the newly created, rotated refresh token.
    expect(savedTokens[1]).toEqual(
      expect.objectContaining({ userId: 42, tokenHash: expect.any(String) }),
    );
    expect(savedTokens[1].tokenHash).not.toBe("old-hash");

    const rawTokenHash = createHash("sha256")
      .update(result.refreshToken)
      .digest("hex");
    expect(savedTokens[1].tokenHash).toBe(rawTokenHash);
    expect(result.refreshToken).not.toBe(savedTokens[1].tokenHash);

    expect(jwtService.sign).toHaveBeenCalledWith({ id: 42, roles: [Role.User] });
    expect(result.accessToken).toBe("signed-access-token");
  });
});
