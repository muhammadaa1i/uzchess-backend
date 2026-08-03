import { GetAuthorsRequest } from "@/features/library/author/queries/get-authors/get-authors.request";

export class GetAuthorsQuery {
  constructor(public readonly payload: GetAuthorsRequest) {}
}
