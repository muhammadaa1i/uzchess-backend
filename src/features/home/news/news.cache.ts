export const NEWS_LIST_CACHE_KEY = "news:list";

export function newsByIdCacheKey(id: number) {
  return `news:${id}`;
}
