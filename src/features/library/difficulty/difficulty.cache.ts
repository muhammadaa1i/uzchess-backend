export const DIFFICULTIES_LIST_CACHE_KEY = "difficulties:list";

export function difficultyByIdCacheKey(id: number) {
  return `difficulties:${id}`;
}
