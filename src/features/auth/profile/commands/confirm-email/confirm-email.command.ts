import {ConfirmEmailRequest} from "@/features/auth/profile/commands/confirm-email/confirm-email.request";

export class ConfirmEmailCommand {
    constructor(
        public readonly userId: number,
        public readonly payload: ConfirmEmailRequest,
    ) {
    }
}
