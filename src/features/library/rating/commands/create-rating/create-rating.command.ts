import { CreateRatingRequest } from "@/features/library/rating/commands/create-rating/create-rating.request";

export class CreateRatingCommand {
  constructor(
    public readonly bookId: number,
    public readonly userId: number,
    public readonly payload: CreateRatingRequest,
  ) {}
}
