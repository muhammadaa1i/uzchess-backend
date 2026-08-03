import { UpdateBookRequest } from "@/features/library/book/commands/update-book/update-book.request";

export class UpdateBookCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateBookRequest,
    public readonly coverPath: string | undefined,
  ) {}
}
