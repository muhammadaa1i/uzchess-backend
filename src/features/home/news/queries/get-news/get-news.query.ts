import { GetNewsRequest } from "@/features/home/news/queries/get-news/get-news.request";

export class GetNewsQuery {
  constructor(public readonly payload: GetNewsRequest) {}
}
