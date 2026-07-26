import { RegisterRequest } from "@/features/auth/user/register/register.request";

export class RegisterCommand {
  constructor(public readonly payload: RegisterRequest) {}
}
