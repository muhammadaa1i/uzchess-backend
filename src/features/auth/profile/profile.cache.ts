export interface PendingEmailChange {
    newEmail: string;
    code: string;
    createdAt: number;
}

export const CHANGE_EMAIL_CODE_TTL_MS = 1000 * 60 * 5;
export const CHANGE_EMAIL_RECORD_TTL_MS = 1000 * 60 * 10;

export function changeEmailCacheKey(userId: number) {
    return `change-email:${userId}`;
}

export function changeEmailCooldownCacheKey(userId: number) {
    return `change-email:cooldown:${userId}`;
}

export function isChangeEmailCodeExpired(pending: PendingEmailChange) {
    return Date.now() - pending.createdAt >= CHANGE_EMAIL_CODE_TTL_MS;
}
