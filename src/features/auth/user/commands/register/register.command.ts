import { RegisterRequest } from "@/features/auth/user/commands/register/register.request";

export class RegisterCommand {
  constructor(public readonly payload: RegisterRequest) {}
}
