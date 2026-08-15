import { UpdateGameOfDayRequest } from "@/features/home/game-of-day/commands/update-game-of-day/update-game-of-day.request";

export class UpdateGameOfDayCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateGameOfDayRequest,
    public readonly videoPath: string | undefined,
    public readonly thumbnailPath: string | undefined,
  ) {}
}
