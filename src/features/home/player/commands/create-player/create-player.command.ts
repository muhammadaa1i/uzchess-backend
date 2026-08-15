import { CreatePlayerRequest } from "@/features/home/player/commands/create-player/create-player.request";

export class CreatePlayerCommand {
  constructor(
    public readonly payload: CreatePlayerRequest,
    public readonly avatarPath: string | undefined,
  ) {}
}
