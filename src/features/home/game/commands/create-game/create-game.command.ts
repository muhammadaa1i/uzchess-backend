import { CreateGameRequest } from "@/features/home/game/commands/create-game/create-game.request";

export class CreateGameCommand {
  constructor(public readonly payload: CreateGameRequest) {}
}
