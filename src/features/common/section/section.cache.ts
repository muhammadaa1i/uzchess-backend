export function sectionsListCacheKey(courseId: number) {
    return `sections:course:${courseId}`;
}

export function sectionByIdCacheKey(id: number) {
    return `sections:${id}`;
}
