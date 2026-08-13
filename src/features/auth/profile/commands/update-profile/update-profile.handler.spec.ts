jest.mock("@/core/configs/multer/multer.config", () => ({
  deleteUploadedFile: jest.fn().mockResolvedValue(undefined),
}));

import { UpdateProfileHandler } from "@/features/auth/profile/commands/update-profile/update-profile.handler";
import { UpdateProfileCommand } from "@/features/auth/profile/commands/update-profile/update-profile.command";
import { UpdateProfileRequest } from "@/features/auth/profile/commands/update-profile/update-profile.request";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";
import { deleteUploadedFile } from "@/core/configs/multer/multer.config";

describe("UpdateProfileHandler", () => {
  let handler: UpdateProfileHandler;

  const makeUser = (overrides: Partial<User> = {}) =>
    ({
      id: 1,
      firstName: "Old",
      lastName: "Name",
      avatar: "old-avatar.png",
      email: "user@example.com",
      isEmailVerified: true,
      birthDate: null,
      save: jest.fn(function (this: any) {
        return Promise.resolve(this);
      }),
      ...overrides,
    }) as unknown as User;

  beforeEach(() => {
    handler = new UpdateProfileHandler();
    (deleteUploadedFile as jest.Mock).mockClear();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdateProfileCommand(999, {} as UpdateProfileRequest, undefined),
      ),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("only changes fields that were provided, leaving undefined fields alone", async () => {
    const user = makeUser();
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);

    const payload = { firstName: "New" } as UpdateProfileRequest;

    await handler.execute(new UpdateProfileCommand(1, payload, undefined));

    expect(user.firstName).toBe("New");
    expect(user.lastName).toBe("Name");
    expect(user.avatar).toBe("old-avatar.png");
  });

  it("replaces the avatar and deletes the old one from storage", async () => {
    const user = makeUser({ avatar: "old-avatar.png" });
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);

    await handler.execute(
      new UpdateProfileCommand(1, {} as UpdateProfileRequest, "new-avatar.png"),
    );

    expect(user.avatar).toBe("new-avatar.png");
    expect(deleteUploadedFile).toHaveBeenCalledWith("old-avatar.png");
  });

  it("does not attempt to delete an avatar that never existed when one is newly added", async () => {
    const user = makeUser({ avatar: null });
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);

    await handler.execute(
      new UpdateProfileCommand(1, {} as UpdateProfileRequest, "new-avatar.png"),
    );

    expect(user.avatar).toBe("new-avatar.png");
    expect(deleteUploadedFile).not.toHaveBeenCalled();
  });

  it("applies birthDate when explicitly provided", async () => {
    const user = makeUser({ birthDate: null });
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);

    await handler.execute(
      new UpdateProfileCommand(
        1,
        { birthDate: "2000-01-01" } as UpdateProfileRequest,
        undefined,
      ),
    );

    expect(user.birthDate).toEqual(new Date("2000-01-01"));
  });

  // Regression guard: UpdateProfileResponse previously omitted @Expose() on
  // isEmailVerified, so it was silently dropped from the response even though
  // the entity had the field. Assert every response field is actually present.
  it("exposes every UpdateProfileResponse field on the returned object, including isEmailVerified", async () => {
    const user = makeUser({
      id: 42,
      firstName: "John",
      lastName: "Doe",
      avatar: "avatar.png",
      email: "john@example.com",
      isEmailVerified: true,
      birthDate: new Date("1990-05-05"),
    });
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);

    const result = await handler.execute(
      new UpdateProfileCommand(1, {} as UpdateProfileRequest, undefined),
    );

    expect(result).toMatchObject({
      id: 42,
      firstName: "John",
      lastName: "Doe",
      avatar: "avatar.png",
      email: "john@example.com",
      isEmailVerified: true,
    });
    expect(result.birthDate).toEqual(new Date("1990-05-05"));
    // Explicitly verify the field that regressed before is present and truthy.
    expect(result.isEmailVerified).toBe(true);
    expect("isEmailVerified" in result).toBe(true);
  });
});
