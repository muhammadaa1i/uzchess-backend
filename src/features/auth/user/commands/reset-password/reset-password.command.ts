import { ResetPasswordRequest } from "@/features/auth/user/commands/reset-password/reset-password.request";

export class ResetPasswordCommand {
  constructor(public readonly payload: ResetPasswordRequest) {}
}
