import {ChangeEmailRequest} from "@/features/auth/profile/commands/change-email/change-email.request";

export class ChangeEmailCommand {
    constructor(
        public readonly userId: number,
        public readonly payload: ChangeEmailRequest,
    ) {
    }
}
