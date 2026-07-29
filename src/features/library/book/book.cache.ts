import { GetBooksResponse } from "@/features/library/book/queries/get-books/get-books.response";

export const BOOKS_LIST_CACHE_KEY = "books:list";

export function bookByIdCacheKey(id: number) {
  return `books:${id}`;
}

export interface CachedBooksList {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: GetBooksResponse[];
}
