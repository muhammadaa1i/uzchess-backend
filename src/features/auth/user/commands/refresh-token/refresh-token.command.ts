import {RefreshTokenRequest} from "@/features/auth/user/commands/refresh-token/refresh-token.request";

export class RefreshTokenCommand {
    constructor(public readonly payload: RefreshTokenRequest) {
    }
}
