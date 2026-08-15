import { UpdateNewsRequest } from "@/features/home/news/commands/update-news/update-news.request";

export class UpdateNewsCommand {
  constructor(
    public readonly id: number,
    public readonly payload: UpdateNewsRequest,
    public readonly imagePath: string | undefined,
  ) {}
}
