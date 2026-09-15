export interface PendingPasswordReset {
  code: string;
  createdAt: number;
}

export const FORGOT_PASSWORD_CODE_TTL_MS = 1000 * 60 * 5;
export const FORGOT_PASSWORD_RECORD_TTL_MS = 1000 * 60 * 10;

export function forgotPasswordCacheKey(userId: number) {
  return `forgot-password:${userId}`;
}

export function forgotPasswordCooldownCacheKey(userId: number) {
  return `forgot-password:cooldown:${userId}`;
}

export function isForgotPasswordCodeExpired(pending: PendingPasswordReset) {
  return Date.now() - pending.createdAt >= FORGOT_PASSWORD_CODE_TTL_MS;
}
