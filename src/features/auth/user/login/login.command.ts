import {LoginRequest} from "@/features/auth/user/login/login.request";

export class LoginCommand {
    constructor(public readonly payload: LoginRequest) {
    }
}