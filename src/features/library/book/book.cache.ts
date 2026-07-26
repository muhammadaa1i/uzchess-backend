export const BOOKS_LIST_CACHE_KEY = "books:list";

export function bookByIdCacheKey(id: number) {
  return `books:${id}`;
}
