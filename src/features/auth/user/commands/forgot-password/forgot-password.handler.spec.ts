jest.mock("@/core/configs/mail/mail.service", () => ({
  sendVerificationCodeEmail: jest.fn().mockResolvedValue(undefined),
}));

import { ForgotPasswordHandler } from "@/features/auth/user/commands/forgot-password/forgot-password.handler";
import { ForgotPasswordCommand } from "@/features/auth/user/commands/forgot-password/forgot-password.command";
import { ForgotPasswordRequest } from "@/features/auth/user/commands/forgot-password/forgot-password.request";
import { User } from "@/features/auth/entities/user/user.entity";
import { TooManyRequestsException } from "@/core/exceptions/too-many-requests.exception";
import {
  forgotPasswordCacheKey,
  forgotPasswordCooldownCacheKey,
} from "@/features/auth/user/user.cache";
import { sendVerificationCodeEmail } from "@/core/configs/mail/mail.service";

describe("ForgotPasswordHandler", () => {
  let handler: ForgotPasswordHandler;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      email: "user@example.com",
      ...overrides,
    }) as unknown as User;

  const payload = (email = "user@example.com") =>
    ({ email }) as ForgotPasswordRequest;

  beforeEach(() => {
    cache = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    handler = new ForgotPasswordHandler(cache as any);
    (sendVerificationCodeEmail as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("returns the generic message without touching the cache or sending an email when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    const result = await handler.execute(
      new ForgotPasswordCommand(payload("nobody@example.com")),
    );

    expect(cache.get).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(sendVerificationCodeEmail).not.toHaveBeenCalled();
    expect(result.message).toBe(
      "If an account exists for this email, a reset code has been sent",
    );
  });

  it("throws TooManyRequestsException (429) when a real user is on cooldown", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(true);

    await expect(
      handler.execute(new ForgotPasswordCommand(payload())),
    ).rejects.toBeInstanceOf(TooManyRequestsException);
    expect(cache.get).toHaveBeenCalledWith(forgotPasswordCooldownCacheKey(1));
  });

  it("stores the pending reset and cooldown in cache, and emails the code, on the happy path", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(undefined);

    const result = await handler.execute(new ForgotPasswordCommand(payload()));

    expect(cache.set).toHaveBeenCalledWith(
      forgotPasswordCacheKey(1),
      expect.objectContaining({
        code: expect.any(String),
        createdAt: expect.any(Number),
      }),
      expect.any(Number),
    );
    expect(cache.set).toHaveBeenCalledWith(
      forgotPasswordCooldownCacheKey(1),
      true,
      expect.any(Number),
    );
    expect(sendVerificationCodeEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.any(String),
    );
    expect(result.message).toBe(
      "If an account exists for this email, a reset code has been sent",
    );
  });

  it("does not let an email send failure change the response", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(makeUser());
    cache.get.mockResolvedValue(undefined);
    (sendVerificationCodeEmail as jest.Mock).mockRejectedValueOnce(
      new Error("SMTP down"),
    );

    const result = await handler.execute(new ForgotPasswordCommand(payload()));

    expect(result.message).toBe(
      "If an account exists for this email, a reset code has been sent",
    );
  });
});
