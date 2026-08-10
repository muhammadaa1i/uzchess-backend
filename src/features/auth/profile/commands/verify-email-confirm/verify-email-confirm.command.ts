import {VerifyEmailConfirmRequest} from "@/features/auth/profile/commands/verify-email-confirm/verify-email-confirm.request";

export class VerifyEmailConfirmCommand {
    constructor(
        public readonly userId: number,
        public readonly payload: VerifyEmailConfirmRequest,
    ) {
    }
}
