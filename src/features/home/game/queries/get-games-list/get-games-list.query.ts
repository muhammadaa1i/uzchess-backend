import { GetGamesListRequest } from "@/features/home/game/queries/get-games-list/get-games-list.request";

export class GetGamesListQuery {
  constructor(public readonly payload: GetGamesListRequest) {}
}
