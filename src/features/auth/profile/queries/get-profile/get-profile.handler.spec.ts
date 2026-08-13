import { GetProfileHandler } from "@/features/auth/profile/queries/get-profile/get-profile.handler";
import { GetProfileQuery } from "@/features/auth/profile/queries/get-profile/get-profile.query";
import { User } from "@/features/auth/entities/user.entity";
import { DoesNotExistException } from "@/core/exceptions/does-not-exist.exception";

describe("GetProfileHandler", () => {
  let handler: GetProfileHandler;

  beforeEach(() => {
    handler = new GetProfileHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws DoesNotExistException (404) when the user doesn't exist", async () => {
    jest.spyOn(User, "findOneBy").mockResolvedValue(null);

    await expect(
      handler.execute(new GetProfileQuery(999)),
    ).rejects.toBeInstanceOf(DoesNotExistException);
  });

  it("returns every GetProfileResponse field, including isEmailVerified", async () => {
    const user = {
      id: 7,
      firstName: "Jane",
      lastName: "Doe",
      avatar: "avatar.png",
      email: "jane@example.com",
      isEmailVerified: true,
      birthDate: new Date("1995-03-03"),
    } as unknown as User;
    jest.spyOn(User, "findOneBy").mockResolvedValue(user);

    const result = await handler.execute(new GetProfileQuery(7));

    expect(result).toMatchObject({
      id: 7,
      firstName: "Jane",
      lastName: "Doe",
      avatar: "avatar.png",
      email: "jane@example.com",
      isEmailVerified: true,
    });
    expect(result.birthDate).toEqual(new Date("1995-03-03"));
  });
});
