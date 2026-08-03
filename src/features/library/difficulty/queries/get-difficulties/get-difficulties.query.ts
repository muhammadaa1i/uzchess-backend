import { GetDifficultiesRequest } from "@/features/library/difficulty/queries/get-difficulties/get-difficulties.request";

export class GetDifficultiesQuery {
  constructor(public readonly payload: GetDifficultiesRequest) {}
}
