import { ConfirmEmailHandler } from "@/features/auth/profile/commands/confirm-email/confirm-email.handler";
import { ConfirmEmailCommand } from "@/features/auth/profile/commands/confirm-email/confirm-email.command";
import { ConfirmEmailRequest } from "@/features/auth/profile/commands/confirm-email/confirm-email.request";
import { User } from "@/features/auth/entities/user/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { GoneException } from "@/core/exceptions/gone.exception";
import {
  changeEmailCacheKey,
  changeEmailCooldownCacheKey,
} from "@/features/auth/profile/profile.cache";

describe("ConfirmEmailHandler", () => {
  let handler: ConfirmEmailHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      email: "old@example.com",
      isEmailVerified: false,
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as User;

  const payload = (code = "123456") =>
    ({ code }) as ConfirmEmailRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new ConfirmEmailHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new ConfirmEmailCommand(999, payload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (404) when there is no pending email change request", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(undefined);

    await expect(
      handler.execute(new ConfirmEmailCommand(1, payload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws GoneException (410) and clears the cache entry when the code has expired", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue({
      newEmail: "new@example.com",
      code: "123456",
      createdAt: Date.now() - 1000 * 60 * 60,
    });

    await expect(
      handler.execute(new ConfirmEmailCommand(1, payload("123456"))),
    ).rejects.toBeInstanceOf(GoneException);
    expect(cache.del).toHaveBeenCalledWith(changeEmailCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the code is wrong", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue({
      newEmail: "new@example.com",
      code: "123456",
      createdAt: Date.now(),
    });

    await expect(
      handler.execute(new ConfirmEmailCommand(1, payload("000000"))),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  // Regression guard: confirming an email change previously left
  // isEmailVerified untouched. Explicitly assert it is set to true on success.
  it("sets user.isEmailVerified to true and updates the email on success", async () => {
    const user = makeUser({ email: "old@example.com", isEmailVerified: false });
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);
    cache.get.mockResolvedValue({
      newEmail: "new@example.com",
      code: "123456",
      createdAt: Date.now(),
    });
    const saveSpy = jest.spyOn(user, "save");

    const result = await handler.execute(
      new ConfirmEmailCommand(1, payload("123456")),
    );

    expect(user.email).toBe("new@example.com");
    expect(user.isEmailVerified).toBe(true);
    expect(saveSpy).toHaveBeenCalled();
    expect(cache.del).toHaveBeenCalledWith(changeEmailCacheKey(1));
    expect(cache.del).toHaveBeenCalledWith(changeEmailCooldownCacheKey(1));
    expect(result.email).toBe("new@example.com");
    expect(result.message).toBe("Email changed successfully");
  });
});
