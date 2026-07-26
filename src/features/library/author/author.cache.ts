export const AUTHORS_LIST_CACHE_KEY = "authors:list";

export function authorByIdCacheKey(id: number) {
  return `authors:${id}`;
}
