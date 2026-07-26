import { JwtUser } from "@/core/types/jwt-user";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}
