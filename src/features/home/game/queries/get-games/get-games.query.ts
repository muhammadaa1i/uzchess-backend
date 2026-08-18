import { GetGamesRequest } from "@/features/home/game/queries/get-games/get-games.request";

export class GetGamesQuery {
  constructor(public readonly payload: GetGamesRequest) {}
}
