import { CreateSectionRequest } from "@/features/common/section/commands/create-section/create-section.request";

export class CreateSectionCommand {
  constructor(public readonly payload: CreateSectionRequest) {}
}
