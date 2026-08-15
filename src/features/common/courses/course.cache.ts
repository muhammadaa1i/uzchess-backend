import { GetCoursesResponse } from "@/features/common/courses/queries/get-courses/get-courses.response";

export const COURSES_LIST_CACHE_KEY = "courses:list";

export const TOP_RATED_COURSES_CACHE_KEY = "courses:top-rated";

export function courseByIdCacheKey(id: number) {
  return `courses:${id}`;
}

export interface CachedCoursesList {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: GetCoursesResponse[];
}
