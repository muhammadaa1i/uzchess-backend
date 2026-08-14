import { VerifyEmailConfirmHandler } from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.handler";
import { VerifyEmailConfirmCommand } from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.command";
import { VerifyEmailConfirmRequest } from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.request";
import { User } from "@/features/auth/entities/user/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { GoneException } from "@/core/exceptions/gone.exception";
import {
  verifyEmailCacheKey,
  verifyEmailCooldownCacheKey,
} from "@/features/auth/profile/profile.cache";

describe("VerifyEmailConfirmHandler", () => {
  let handler: VerifyEmailConfirmHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      email: "user@example.com",
      isEmailVerified: false,
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as User;

  const payload = (code = "123456") =>
    ({ code }) as VerifyEmailConfirmRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new VerifyEmailConfirmHandler(cache as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new VerifyEmailConfirmCommand(999, payload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws AlreadyExistException (409) when the email is already verified", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(
      makeUser({ isEmailVerified: true }),
    );

    await expect(
      handler.execute(new VerifyEmailConfirmCommand(1, payload())),
    ).rejects.toBeInstanceOf(AlreadyExistException);
  });

  it("throws DoesNotExistException (404) when there is no pending verification", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(undefined);

    await expect(
      handler.execute(new VerifyEmailConfirmCommand(1, payload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws GoneException (410) and clears the cache entry when the code has expired", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue({
      code: "123456",
      createdAt: Date.now() - 1000 * 60 * 60,
    });

    await expect(
      handler.execute(new VerifyEmailConfirmCommand(1, payload("123456"))),
    ).rejects.toBeInstanceOf(GoneException);
    expect(cache.del).toHaveBeenCalledWith(verifyEmailCacheKey(1));
  });

  it("throws DoesNotExistException (404) when the code is wrong", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue({ code: "123456", createdAt: Date.now() });

    await expect(
      handler.execute(new VerifyEmailConfirmCommand(1, payload("000000"))),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("sets user.isEmailVerified to true on success", async () => {
    const user = makeUser({ isEmailVerified: false });
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);
    cache.get.mockResolvedValue({ code: "123456", createdAt: Date.now() });
    const saveSpy = jest.spyOn(user, "save");

    const result = await handler.execute(
      new VerifyEmailConfirmCommand(1, payload("123456")),
    );

    expect(user.isEmailVerified).toBe(true);
    expect(saveSpy).toHaveBeenCalled();
    expect(cache.del).toHaveBeenCalledWith(verifyEmailCacheKey(1));
    expect(cache.del).toHaveBeenCalledWith(verifyEmailCooldownCacheKey(1));
    expect(result.email).toBe("user@example.com");
    expect(result.message).toBe("Email verified successfully");
  });
});
