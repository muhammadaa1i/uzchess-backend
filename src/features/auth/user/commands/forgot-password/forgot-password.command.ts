import { ForgotPasswordRequest } from "@/features/auth/user/commands/forgot-password/forgot-password.request";

export class ForgotPasswordCommand {
  constructor(public readonly payload: ForgotPasswordRequest) {}
}
