export const COURSE_CATEGORIES_LIST_CACHE_KEY = "courseCategories:list";

export function courseCategoryByIdCacheKey(id: number) {
    return `courseCategories:${id}`;
}
