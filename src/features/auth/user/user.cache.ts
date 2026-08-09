export const LOGOUT_MARKER_TTL_MS = 1000 * 60 * 60 * 24 * 365;

export function logoutCacheKey(userId: number) {
    return `logout:${userId}`;
}
