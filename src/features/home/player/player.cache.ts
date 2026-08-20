import { GetPlayersRankingResponse } from "@/features/home/player/queries/get-players-ranking/get-players-ranking.response";

export const PLAYERS_RANKING_CACHE_KEY = "players:ranking";

export const RANKING_FILTERS_CACHE_KEY = "players:ranking-filters";

export const PLAYERS_TOP_CACHE_KEY = "players:top";

export function playerByIdCacheKey(id: number) {
  return `players:${id}`;
}

export interface CachedPlayersRanking {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: GetPlayersRankingResponse[];
}
