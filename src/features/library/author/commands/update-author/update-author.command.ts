import { UpdateAuthorRequest } from "@/features/library/author/commands/update-author/update-author.request";

export class UpdateAuthorCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateAuthorRequest,
  ) {}
}
