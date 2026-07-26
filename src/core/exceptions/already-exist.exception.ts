import { ConflictException } from "@nestjs/common";

export class AlreadyExistException extends ConflictException {
  static ThrowIf(condition: boolean, message: string = "Already exist") {
    if (condition) throw new AlreadyExistException(message);
  }
}
