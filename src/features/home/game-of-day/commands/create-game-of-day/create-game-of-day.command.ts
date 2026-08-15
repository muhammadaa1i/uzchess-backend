import { CreateGameOfDayRequest } from "@/features/home/game-of-day/commands/create-game-of-day/create-game-of-day.request";

export class CreateGameOfDayCommand {
  constructor(
    public readonly payload: CreateGameOfDayRequest,
    public readonly videoPath: string,
    public readonly thumbnailPath: string,
  ) {}
}
