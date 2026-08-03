import { GetBooksRequest } from "@/features/library/book/queries/get-books/get-books.request";

export class GetBooksQuery {
  constructor(public readonly payload: GetBooksRequest) {}
}
