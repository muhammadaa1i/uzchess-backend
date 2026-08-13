import { IsNull } from "typeorm";
import { LogoutHandler } from "@/features/auth/user/commands/logout/logout.handler";
import { LogoutCommand } from "@/features/auth/user/commands/logout/logout.command";
import { RefreshToken } from "@/features/auth/entities/refresh-token.entity";

describe("LogoutHandler", () => {
  let handler: LogoutHandler;

  beforeEach(() => {
    handler = new LogoutHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("revokes all of the user's active refresh tokens", async () => {
    const updateSpy = jest
      .spyOn(RefreshToken, "update")
      .mockResolvedValue({ affected: 2 } as any);

    const result = await handler.execute(new LogoutCommand(42));

    expect(updateSpy).toHaveBeenCalledWith(
      { userId: 42, revokedAt: IsNull() },
      { revokedAt: expect.any(String) },
    );
    expect(result.message).toBe("Logged out successfully");
  });
});
