jest.mock("@/core/configs/mail/mail.service", () => ({
  sendVerificationCodeEmail: jest.fn().mockResolvedValue(undefined),
}));

import { VerifyEmailResendHandler } from "@/features/auth/profile/commands/verify-email-resend/verify-email-resend.handler";
import { VerifyEmailResendCommand } from "@/features/auth/profile/commands/verify-email-resend/verify-email-resend.command";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { AlreadyExistException } from "@/core/exceptions/already-exist.exception";
import { TooManyRequestsException } from "@/core/exceptions/too-many-requests.exception";
import {
  verifyEmailCacheKey,
  verifyEmailCooldownCacheKey,
} from "@/features/auth/profile/profile.cache";
import { sendVerificationCodeEmail } from "@/core/configs/mail/mail.service";

describe("VerifyEmailResendHandler", () => {
  let handler: VerifyEmailResendHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      email: "user@example.com",
      isEmailVerified: false,
      ...overrides,
    }) as unknown as User;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new VerifyEmailResendHandler(cache as any);
    (sendVerificationCodeEmail as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new VerifyEmailResendCommand(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws AlreadyExistException (409) when the email is already verified", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(
      makeUser({ isEmailVerified: true }),
    );

    await expect(
      handler.execute(new VerifyEmailResendCommand(1)),
    ).rejects.toBeInstanceOf(AlreadyExistException);
  });

  it("throws TooManyRequestsException (429) when on cooldown", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(true);

    await expect(
      handler.execute(new VerifyEmailResendCommand(1)),
    ).rejects.toBeInstanceOf(TooManyRequestsException);
    expect(cache.get).toHaveBeenCalledWith(verifyEmailCooldownCacheKey(1));
  });

  it("stores a new code, resets the cooldown, and emails it on the happy path", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(undefined);

    const result = await handler.execute(new VerifyEmailResendCommand(1));

    expect(cache.set).toHaveBeenCalledWith(
      verifyEmailCacheKey(1),
      expect.objectContaining({ code: expect.any(String), createdAt: expect.any(Number) }),
      expect.any(Number),
    );
    expect(cache.set).toHaveBeenCalledWith(
      verifyEmailCooldownCacheKey(1),
      true,
      expect.any(Number),
    );
    expect(sendVerificationCodeEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.any(String),
    );
    expect(result.email).toBe("user@example.com");
    expect(result.message).toBe("Confirmation code sent");
  });
});
