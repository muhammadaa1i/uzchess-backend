export const ACTIVE_GAME_OF_DAY_CACHE_KEY = "game-of-day:active";

export const GAME_OF_DAYS_LIST_CACHE_KEY = "game-of-day:list";

export function gameOfDayByIdCacheKey(id: number) {
    return `game-of-day:${id}`;
}
