import { CreateAuthorRequest } from "@/features/library/author/commands/create-author/create-author.request";

export class CreateAuthorCommand {
  constructor(public readonly payload: CreateAuthorRequest) {}
}
