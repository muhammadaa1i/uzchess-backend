import { CreateBannerRequest } from "@/features/home/banner/commands/create-banner/create-banner.request";

export class CreateBannerCommand {
  constructor(
    public readonly payload: CreateBannerRequest,
    public readonly imagePath: string | undefined,
  ) {}
}
