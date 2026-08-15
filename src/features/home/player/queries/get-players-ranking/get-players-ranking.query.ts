import { GetPlayersRankingRequest } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.request";

export class GetPlayersRankingQuery {
  constructor(public readonly payload: GetPlayersRankingRequest) {}
}
