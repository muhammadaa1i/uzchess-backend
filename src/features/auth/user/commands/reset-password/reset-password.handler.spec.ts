import { IsNull } from "typeorm";
import argon2 from "argon2";
import { ResetPasswordHandler } from "@/features/auth/user/commands/reset-password/reset-password.handler";
import { ResetPasswordCommand } from "@/features/auth/user/commands/reset-password/reset-password.command";
import { ResetPasswordRequest } from "@/features/auth/user/commands/reset-password/reset-password.request";
import { User } from "@/features/auth/entities/user/user.entity";
import { RefreshToken } from "@/features/auth/entities/refresh-token/refresh-token.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { GoneException } from "@/core/exceptions/gone.exception";
import {
  forgotPasswordCacheKey,
  forgotPasswordCooldownCacheKey,
} from "@/features/auth/user/user.cache";

describe("ResetPasswordHandler", () => {
  let handler: ResetPasswordHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      email: "user@example.com",
      password: "hashed-old-password",
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as User;

  const payload = (overrides: Partial<ResetPasswordRequest> = {}) => ({
    email: "user@example.com",
    code: "123456",
    newPassword: "newpassword123",
    confirmNewPassword: "newpassword123",
    ...overrides,
  });

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new ResetPasswordHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new ResetPasswordCommand(payload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (404) when there is no pending reset", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(undefined);

    await expect(
      handler.execute(new ResetPasswordCommand(payload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws GoneException (410) and clears the cache entry when the code has expired", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue({
      code: "123456",
      createdAt: Date.now() - 1000 * 60 * 60,
    });

    await expect(
      handler.execute(new ResetPasswordCommand(payload())),
    ).rejects.toBeInstanceOf(GoneException);
    expect(cache.del).toHaveBeenCalledWith(forgotPasswordCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the code is wrong", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue({ code: "123456", createdAt: Date.now() });

    await expect(
      handler.execute(new ResetPasswordCommand(payload({ code: "000000" }))),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws BadRequestException when newPassword and confirmNewPassword don't match", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue({ code: "123456", createdAt: Date.now() });

    await expect(
      handler.execute(
        new ResetPasswordCommand(payload({ confirmNewPassword: "different" })),
      ),
    ).rejects.toThrow("Passwords do not match");
  });

  it("resets the password, revokes refresh tokens, and clears cache on the happy path", async () => {
    const user = makeUser();
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);
    cache.get.mockResolvedValue({ code: "123456", createdAt: Date.now() });
    const hashSpy = jest
      .spyOn(argon2, "hash")
      .mockResolvedValue("hashed-new-password");
    const saveSpy = jest.spyOn(user, "save");
    const updateSpy = jest
      .spyOn(RefreshToken, "update")
      .mockResolvedValue({ affected: 1 } as any);

    const result = await handler.execute(new ResetPasswordCommand(payload()));

    expect(hashSpy).toHaveBeenCalledWith("newpassword123");
    expect(user.password).toBe("hashed-new-password");
    expect(saveSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith(
      { userId: 1, revokedAt: IsNull() },
      { revokedAt: expect.any(String) },
    );
    expect(cache.del).toHaveBeenCalledWith(forgotPasswordCacheKey(1));
    expect(cache.del).toHaveBeenCalledWith(forgotPasswordCooldownCacheKey(1));
    expect(result.message).toBe("Password reset successfully");
  });
});
