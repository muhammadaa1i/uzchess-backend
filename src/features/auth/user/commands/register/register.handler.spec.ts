jest.mock("@/core/configs/mail/mail.service", () => ({
  sendVerificationCodeEmail: jest.fn().mockResolvedValue(undefined),
}));

import argon2 from "argon2";
import { RegisterHandler } from "@/features/auth/user/commands/register/register.handler";
import { RegisterCommand } from "@/features/auth/user/commands/register/register.command";
import { RegisterRequest } from "@/features/auth/user/commands/register/register.request";
import { User } from "@/features/auth/entities/user.entity";
import { RefreshToken } from "@/features/auth/entities/refresh-token.entity";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { sendVerificationCodeEmail } from "@/core/configs/mail/mail.service";
import { verifyEmailCacheKey } from "@/features/auth/profile/profile.cache";

describe("RegisterHandler", () => {
  let handler: RegisterHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const basePayload = (overrides: Partial<RegisterRequest> = {}) =>
    ({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
      ...overrides,
    }) as RegisterRequest;

  beforeEach(() => {
    cache = { get: jest.fn(), set: jest.fn().mockResolvedValue(undefined), del: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue("signed-access-token") };
    handler = new RegisterHandler(cache as any, jwtService as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws AlreadyExistException (409) when the email is already taken", async () => {
    jest.spyOn(User, "existsBy").mockResolvedValue(true);
    const saveSpy = jest.spyOn(User, "save");

    await expect(
      handler.execute(new RegisterCommand(basePayload())),
    ).rejects.toBeInstanceOf(AlreadyExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws BadRequestException when password and confirmPassword don't match", async () => {
    jest.spyOn(User, "existsBy").mockResolvedValue(false);
    const saveSpy = jest.spyOn(User, "save");

    await expect(
      handler.execute(
        new RegisterCommand(basePayload({ confirmPassword: "different" })),
      ),
    ).rejects.toThrow("Passwords do not match");
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("registers a user on the happy path", async () => {
    jest.spyOn(User, "existsBy").mockResolvedValue(false);
    jest.spyOn(User, "create").mockReturnValue({
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "password123",
      isEmailVerified: false,
    } as any);
    const hashSpy = jest.spyOn(argon2, "hash").mockResolvedValue("hashed-password" as any);
    const savedUser = {
      id: 1,
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "hashed-password",
      isEmailVerified: false,
    };
    const userSaveSpy = jest.spyOn(User, "save").mockResolvedValue(savedUser as any);
    jest.spyOn(RefreshToken, "create").mockReturnValue({} as any);
    const refreshTokenSaveSpy = jest.spyOn(RefreshToken, "save").mockResolvedValue({} as any);

    const result = await handler.execute(new RegisterCommand(basePayload()));

    expect(hashSpy).toHaveBeenCalledWith("password123");
    expect(userSaveSpy).toHaveBeenCalled();
    expect(refreshTokenSaveSpy).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalledWith({ id: 1, roles: [] });
    expect(cache.set).toHaveBeenCalledWith(
      verifyEmailCacheKey(1),
      expect.objectContaining({ code: expect.any(String), createdAt: expect.any(Number) }),
      expect.any(Number),
    );
    expect(sendVerificationCodeEmail).toHaveBeenCalledWith(
      "john@example.com",
      expect.any(String),
    );
    expect(result.accessToken).toBe("signed-access-token");
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.id).toBe(1);
  });
});
