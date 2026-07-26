import { NotFoundException } from "@nestjs/common";

export class DoesNotExistException extends NotFoundException {
  static ThrowIfNull<T>(
    obj: T,
    message: string = "Does not exist",
  ): asserts obj is NonNullable<T> {
    if (obj === null || obj === undefined) {
      throw new DoesNotExistException(message);
    }
  }

  static ThrowIf(condition: boolean, message: string = "Does not exist") {
    if (condition) {
      throw new DoesNotExistException(message);
    }
  }
}
