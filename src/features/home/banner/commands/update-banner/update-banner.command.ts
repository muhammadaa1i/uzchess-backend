import { UpdateBannerRequest } from "@/features/home/banner/commands/update-banner/update-banner.request";

export class UpdateBannerCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateBannerRequest,
    public readonly imagePath: string | undefined,
  ) {}
}
