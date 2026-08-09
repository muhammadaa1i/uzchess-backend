import { UpdateProfileRequest } from "@/features/auth/profile/commands/update-profile/update-profile.request";

export class UpdateProfileCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateProfileRequest,
    public readonly avatarPath: string | undefined,
  ) {}
}
