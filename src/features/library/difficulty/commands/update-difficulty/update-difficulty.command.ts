import { UpdateDifficultyRequest } from "@/features/library/difficulty/commands/update-difficulty/update-difficulty.request";

export class UpdateDifficultyCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateDifficultyRequest,
    public readonly iconPath: string,
  ) {}
}
