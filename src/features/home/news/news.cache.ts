import { GetNewsResponse } from "@/features/home/news/queries/get-news/get-news.response";

export const NEWS_LIST_CACHE_KEY = "news:list";

export function newsByIdCacheKey(id: number) {
  return `news:${id}`;
}

export interface CachedNewsList {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: GetNewsResponse[];
}
