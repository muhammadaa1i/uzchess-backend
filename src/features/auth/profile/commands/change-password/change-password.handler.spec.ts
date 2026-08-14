import argon2 from "argon2";
import { ChangePasswordHandler } from "@/features/auth/profile/commands/change-password/change-password.handler";
import { ChangePasswordCommand } from "@/features/auth/profile/commands/change-password/change-password.command";
import { ChangePasswordRequest } from "@/features/auth/profile/commands/change-password/change-password.request";
import { User } from "@/features/auth/entities/user/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("ChangePasswordHandler", () => {
  let handler: ChangePasswordHandler;

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      password: "hashed-current-password",
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as User;

  const basePayload = (overrides: Partial<ChangePasswordRequest> = {}) =>
    ({
      currentPassword: "current123",
      newPassword: "newpassword123",
      confirmNewPassword: "newpassword123",
      ...overrides,
    }) as ChangePasswordRequest;

  beforeEach(() => {
    handler = new ChangePasswordHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new ChangePasswordCommand(999, basePayload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("throws DoesNotExistException (guard) when the current password is wrong", async () => {
    const user = makeUser();
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);
    jest.spyOn(argon2, "verify").mockResolvedValue(false);
    const saveSpy = jest.spyOn(user, "save");

    await expect(
      handler.execute(new ChangePasswordCommand(1, basePayload())),
    ).rejects.toBeInstanceOf(DoesNotExistException);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("throws BadRequestException when newPassword and confirmNewPassword don't match", async () => {
    const user = makeUser();
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);
    jest.spyOn(argon2, "verify").mockResolvedValue(true);
    const saveSpy = jest.spyOn(user, "save");

    await expect(
      handler.execute(
        new ChangePasswordCommand(
          1,
          basePayload({ confirmNewPassword: "different" }),
        ),
      ),
    ).rejects.toThrow("Passwords do not match");
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("hashes and saves the new password on the happy path", async () => {
    const user = makeUser();
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);
    const verifySpy = jest.spyOn(argon2, "verify").mockResolvedValue(true);
    const hashSpy = jest
      .spyOn(argon2, "hash")
      .mockResolvedValue("hashed-new-password" as any);
    const saveSpy = jest.spyOn(user, "save");

    const result = await handler.execute(
      new ChangePasswordCommand(1, basePayload()),
    );

    expect(verifySpy).toHaveBeenCalledWith(
      "hashed-current-password",
      "current123",
    );
    expect(hashSpy).toHaveBeenCalledWith("newpassword123");
    expect(user.password).toBe("hashed-new-password");
    expect(saveSpy).toHaveBeenCalled();
    expect(result.message).toBe("Password changed successfully");
  });
});
