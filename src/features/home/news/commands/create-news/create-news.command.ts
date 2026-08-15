import { CreateNewsRequest } from "@/features/home/news/commands/create-news/create-news.request";

export class CreateNewsCommand {
  constructor(
    public readonly payload: CreateNewsRequest,
    public readonly imagePath: string | undefined,
  ) {}
}
