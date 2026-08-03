import { CreateDifficultyRequest } from "@/features/library/difficulty/commands/create-difficulty/create-difficulty.request";

export class CreateDifficultyCommand {
  constructor(
    public readonly payload: CreateDifficultyRequest,
    public readonly iconPath: string,
  ) {}
}
