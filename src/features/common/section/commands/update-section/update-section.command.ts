import { UpdateSectionRequest } from "@/features/common/section/commands/update-section/update-section.request";

export class UpdateSectionCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateSectionRequest,
  ) {}
}
