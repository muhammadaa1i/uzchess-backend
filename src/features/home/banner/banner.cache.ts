export const BANNERS_LIST_CACHE_KEY = "banners:list";

export function bannerByIdCacheKey(id: number) {
  return `banners:${id}`;
}
