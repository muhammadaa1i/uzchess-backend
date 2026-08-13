jest.mock("@/core/configs/mail/mail.service", () => ({
  sendVerificationCodeEmail: jest.fn().mockResolvedValue(undefined),
}));

import { ResendEmailHandler } from "@/features/auth/profile/commands/resend-email/resend-email.handler";
import { ResendEmailCommand } from "@/features/auth/profile/commands/resend-email/resend-email.command";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { TooManyRequestsException } from "@/core/exceptions/too-many-requests.exception";
import {
  changeEmailCacheKey,
  changeEmailCooldownCacheKey,
} from "@/features/auth/profile/profile.cache";
import { sendVerificationCodeEmail } from "@/core/configs/mail/mail.service";

describe("ResendEmailHandler", () => {
  let handler: ResendEmailHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new ResendEmailHandler(cache as any);
    (sendVerificationCodeEmail as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when there is no pending email change request", async () => {
    cache.get.mockResolvedValue(undefined);

    await expect(
      handler.execute(new ResendEmailCommand(1)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws TooManyRequestsException (429) when on cooldown", async () => {
    cache.get.mockImplementation((key: string) => {
      if (key === changeEmailCacheKey(1)) {
        return Promise.resolve({
          newEmail: "new@example.com",
          code: "123456",
          createdAt: Date.now(),
        });
      }
      if (key === changeEmailCooldownCacheKey(1)) {
        return Promise.resolve(true);
      }
      return Promise.resolve(undefined);
    });

    await expect(
      handler.execute(new ResendEmailCommand(1)),
    ).rejects.toBeInstanceOf(TooManyRequestsException);
  });

  it("issues a new code, resets the cooldown, and emails it on the happy path", async () => {
    cache.get.mockImplementation((key: string) => {
      if (key === changeEmailCacheKey(1)) {
        return Promise.resolve({
          newEmail: "new@example.com",
          code: "old-code",
          createdAt: Date.now() - 1000,
        });
      }
      return Promise.resolve(undefined);
    });

    const result = await handler.execute(new ResendEmailCommand(1));

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
