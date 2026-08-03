import { UpdateLanguageRequest } from "@/features/library/languages/commands/update-language/update-language.request";

export class UpdateLanguageCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateLanguageRequest,
  ) {}
}
