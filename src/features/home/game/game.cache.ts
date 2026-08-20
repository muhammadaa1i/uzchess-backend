import { GetGamesListResponse } from "@/features/home/game/queries/get-games-list/get-games-list.response";

export const GAMES_LIST_CACHE_KEY = "games:list";

export const GAMES_FILTERS_CACHE_KEY = "games:filters";

export const GAMES_RECENT_CACHE_KEY = "games:recent";

export function gameByIdCacheKey(id: number) {
  return `games:${id}`;
}

export interface CachedGamesList {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: GetGamesListResponse[];
}
