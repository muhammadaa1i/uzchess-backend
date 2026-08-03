import { CreateBookRequest } from "@/features/library/book/commands/create-book/create-book.request";

export class CreateBookCommand {
  constructor(
    public readonly payload: CreateBookRequest,
    public readonly coverPath: string,
  ) {}
}
