import { HttpException, HttpStatus } from "@nestjs/common";

export class TooManyRequestsException extends HttpException {
  constructor(message: string = "Too many requests") {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static ThrowIf(condition: boolean, message: string = "Too many requests") {
    if (condition) throw new TooManyRequestsException(message);
  }
}
