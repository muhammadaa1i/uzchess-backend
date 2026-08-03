import { CreateLanguageRequest } from "@/features/library/languages/commands/create-language/create-language.request";

export class CreateLanguageCommand {
  constructor(public readonly payload: CreateLanguageRequest) {}
}
