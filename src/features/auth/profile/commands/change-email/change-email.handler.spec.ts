jest.mock("@/core/configs/mail/mail.service", () => ({
  sendVerificationCodeEmail: jest.fn().mockResolvedValue(undefined),
}));

import argon2 from "argon2";
import { ChangeEmailHandler } from "@/features/auth/profile/commands/change-email/change-email.handler";
import { ChangeEmailCommand } from "@/features/auth/profile/commands/change-email/change-email.command";
import { ChangeEmailRequest } from "@/features/auth/profile/commands/change-email/change-email.request";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { TooManyRequestsException } from "@/core/exceptions/too-many-requests.exception";
import {
  changeEmailCacheKey,
  changeEmailCooldownCacheKey,
} from "@/features/auth/profile/profile.cache";
import { sendVerificationCodeEmail } from "@/core/configs/mail/mail.service";

describe("ChangeEmailHandler", () => {
  let handler: ChangeEmailHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      password: "hashed-current-password",
      email: "old@example.com",
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as User;

  const basePayload = (overrides: Partial<ChangeEmailRequest> = {}) =>
    ({
      currentPassword: "current123",
      newEmail: "new@example.com",
      ...overrides,
    }) as ChangeEmailRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new ChangeEmailHandler(cache as any);
    (sendVerificationCodeEmail as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new ChangeEmailCommand(999, basePayload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (guard) when the password is wrong", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    jest.spyOn(argon2, "verify").mockResolvedValue(false);

    await expect(
      handler.execute(new ChangeEmailCommand(1, basePayload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws AlreadyExistException (409) when the new email is already in use by another user", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    jest.spyOn(argon2, "verify").mockResolvedValue(true);
    jest.spyOn(User, "existsBy").mockResolvedValue(true);

    await expect(
      handler.execute(new ChangeEmailCommand(1, basePayload())),
    ).rejects.toBeInstanceOf(AlreadyExistException);
  });

  it("throws TooManyRequestsException (429) when on cooldown", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    jest.spyOn(argon2, "verify").mockResolvedValue(true);
    jest.spyOn(User, "existsBy").mockResolvedValue(false);
    cache.get.mockResolvedValue(true);

    await expect(
      handler.execute(new ChangeEmailCommand(1, basePayload())),
    ).rejects.toBeInstanceOf(TooManyRequestsException);
    expect(cache.get).toHaveBeenCalledWith(changeEmailCooldownCacheKey(1));
  });

  it("stores the pending change and cooldown in cache, and emails the code, on the happy path", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    jest.spyOn(argon2, "verify").mockResolvedValue(true);
    jest.spyOn(User, "existsBy").mockResolvedValue(false);
    cache.get.mockResolvedValue(undefined);

    const result = await handler.execute(
      new ChangeEmailCommand(1, basePayload({ newEmail: "new@example.com" })),
    );

    expect(cache.set).toHaveBeenCalledWith(
      changeEmailCacheKey(1),
      expect.objectContaining({
        newEmail: "new@example.com",
        code: expect.any(String),
        createdAt: expect.any(Number),
      }),
      expect.any(Number),
    );
    expect(cache.set).toHaveBeenCalledWith(
      changeEmailCooldownCacheKey(1),
      true,
      expect.any(Number),
    );
    expect(sendVerificationCodeEmail).toHaveBeenCalledWith(
      "new@example.com",
      expect.any(String),
    );
    expect(result.email).toBe("new@example.com");
    expect(result.message).toBe("Confirmation code sent");
  });
});
