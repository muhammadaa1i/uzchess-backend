export const LANGUAGES_LIST_CACHE_KEY = "languages:list";

export function languageByIdCacheKey(id: number) {
  return `languages:${id}`;
}
