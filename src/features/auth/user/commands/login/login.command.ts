import { LoginRequest } from "@/features/auth/user/commands/login/login.request";

export class LoginCommand {
  constructor(public readonly payload: LoginRequest) {}
}
