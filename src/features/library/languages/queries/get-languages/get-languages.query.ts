import { GetLanguagesRequest } from "@/features/library/languages/queries/get-languages/get-languages.request";

export class GetLanguagesQuery {
  constructor(public readonly payload: GetLanguagesRequest) {}
}
