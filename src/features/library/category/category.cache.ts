export const CATEGORIES_LIST_CACHE_KEY = "categories:list";

export function categoryByIdCacheKey(id: number) {
  return `categories:${id}`;
}
