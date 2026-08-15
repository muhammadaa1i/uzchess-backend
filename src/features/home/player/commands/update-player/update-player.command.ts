import { UpdatePlayerRequest } from "@/features/home/player/commands/update-player/update-player.request";

export class UpdatePlayerCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdatePlayerRequest,
    public readonly avatarPath: string | undefined,
  ) {}
}
