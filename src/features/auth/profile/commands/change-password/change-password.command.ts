import {ChangePasswordRequest} from "@/features/auth/profile/commands/change-password/change-password.request";

export class ChangePasswordCommand {
    constructor(
        public readonly userId: number,
        public readonly payload: ChangePasswordRequest,
    ) {
    }
}
