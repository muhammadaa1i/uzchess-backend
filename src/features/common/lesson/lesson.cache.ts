export function lessonsListCacheKey(sectionId: number) {
    return `lessons:section:${sectionId}`;
}

export function lessonByIdCacheKey(id: number) {
    return `lessons:${id}`;
}
