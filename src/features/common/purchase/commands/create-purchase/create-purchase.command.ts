import { CreatePurchaseRequest } from "@/features/common/purchase/commands/create-purchase/create-purchase.request";

export class CreatePurchaseCommand {
  constructor(
    public readonly userId: number,
    public readonly courseId: number,
    public readonly payload: CreatePurchaseRequest,
  ) {}
}
