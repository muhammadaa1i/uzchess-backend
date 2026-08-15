import { GetPlayersRequest } from "@/features/home/player/queries/get-players/get-players.request";

export class GetPlayersQuery {
  constructor(public readonly payload: GetPlayersRequest) {}
}
