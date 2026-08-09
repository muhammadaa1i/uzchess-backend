import { HttpException, HttpStatus } from "@nestjs/common";

export class GoneException extends HttpException {
  constructor(message: string = "Gone") {
    super(message, HttpStatus.GONE);
  }

  static ThrowIf(condition: boolean, message: string = "Gone") {
    if (condition) throw new GoneException(message);
  }
}
